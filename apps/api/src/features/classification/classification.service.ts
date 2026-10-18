import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource, In, LessThanOrEqual } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Category } from '../categories/entities/category.entity';
import { RulesService } from '../rules/rules.service';
import { ClassificationWork } from './entities/classification-work.entity';
import { ClassificationState } from './entities/classification-state.entity';
import { TransactionSuggestion } from './entities/transaction-suggestion.entity';
import { DecisionConnection } from './entities/decision-connection.entity';
import { DecisionConnectionsService } from './decision-connections.service';
import {
  ClassificationRunRequestDto,
  ClassificationRunDto,
} from './dto/classification.dto';
import {
  buildState,
  buildOptions,
  hash,
  INSTRUCTIONS_VERSION,
  STATE_VERSION,
  resolveScores,
} from './classification.logic';
import { JevClient } from './jev-client.service';
import { DecisionError } from './http/safe-http-client';
import { ClassificationLimits } from './classification-limits.service';

class StaleClassificationError extends Error {}

@Injectable()
export class ClassificationService {
  constructor(
    private readonly db: DataSource,
    private readonly rules: RulesService,
    private readonly connections: DecisionConnectionsService,
    private readonly client: JevClient,
    private readonly limits: ClassificationLimits,
  ) {}
  async run({
    userId,
    dto,
  }: {
    userId: string;
    dto: ClassificationRunRequestDto;
  }): Promise<ClassificationRunDto> {
    if ((dto.scope === 'inbox') === Boolean(dto.transactionIds))
      throw new BadRequestException('Choose inbox or transaction IDs');
    const runId = randomUUID();
    await this.db.transaction(async (manager) => {
      const owners: { id: string }[] = await manager.query(
        'SELECT id FROM users WHERE id=$1 AND deleted_at IS NULL FOR KEY SHARE',
        [userId],
      );
      if (!owners.length) throw new NotFoundException();
      await manager.query(
        'INSERT INTO classification_state(user_id) VALUES($1) ON CONFLICT DO NOTHING',
        [userId],
      );
      const state = await manager.findOne(ClassificationState, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      const transactionQuery = () =>
        manager
          .getRepository(Transaction)
          .createQueryBuilder('t')
          .innerJoin('t.account', 'a')
          .where('a.user_id = :userId', { userId })
          .andWhere('t.categoryId IS NULL');
      let transactions: Transaction[];
      if (dto.transactionIds) {
        transactions = await transactionQuery()
          .andWhere('t.id IN (:...ids)', { ids: dto.transactionIds })
          .orderBy('t.id')
          .take(10000)
          .getMany();
      } else {
        const cursor = state?.inbox_cursor;
        let page = await transactionQuery()
          .andWhere(cursor ? 't.id > :cursor' : 'TRUE', { cursor })
          .orderBy('t.id')
          .take(10001)
          .getMany();
        if (cursor && !page.length) {
          page = await transactionQuery().orderBy('t.id').take(10001).getMany();
        }
        const hasMore = page.length > 10000;
        transactions = page.slice(0, 10000);
        if (transactions.length && state) {
          state.inbox_cursor = hasMore
            ? transactions[transactions.length - 1].id
            : null;
          await manager.save(state);
        }
      }
      if (
        dto.transactionIds &&
        transactions.length !== new Set(dto.transactionIds).size
      )
        throw new BadRequestException(
          'Transactions must be owned and uncategorized',
        );
      if (!transactions.length)
        throw new BadRequestException('No uncategorized transactions');
      // Capture revisions in the same statement used by the creation trigger.
      await manager.getRepository(ClassificationWork).insert(
        transactions.map((t) => ({
          user_id: userId,
          run_id: runId,
          transaction_id: t.id,
          transaction_revision: t.revision,
        })),
      );
    });
    return this.status({ userId, runId });
  }
  async status({
    userId,
    runId,
  }: {
    userId: string;
    runId: string;
  }): Promise<ClassificationRunDto> {
    const rows: { status: string; count: string }[] = await this.db.query(
      'SELECT status, count(*)::text AS count FROM classification_work WHERE user_id=$1 AND run_id=$2 GROUP BY status',
      [userId, runId],
    );
    if (!rows.length) throw new NotFoundException();
    const counts = Object.fromEntries(
      rows.map((r) => [r.status, Number(r.count)]),
    );
    const queued = counts.queued ?? 0;
    return {
      runId,
      queued,
      processed: rows.reduce(
        (sum, r) => sum + (r.status === 'queued' ? 0 : Number(r.count)),
        0,
      ),
      suggested: counts.suggested ?? 0,
      abstained: counts.abstained ?? 0,
      skipped: counts.skipped ?? 0,
      failed: counts.failed ?? 0,
      complete: queued === 0,
    };
  }
  async dismiss({ userId, id }: { userId: string; id: string }) {
    const result = await this.db
      .getRepository(TransactionSuggestion)
      .update(
        { user_id: userId, id, status: 'pending' },
        { status: 'dismissed', resolved_at: new Date() },
      );
    if (!result.affected) throw new NotFoundException();
  }
  async stats({ userId }: { userId: string }) {
    const rows: { status: string; count: string }[] = await this.db.query(
      "SELECT status, count(*)::text AS count FROM transaction_suggestions WHERE user_id=$1 AND created_at >= now() - interval '30 days' GROUP BY status",
      [userId],
    );
    const c = Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
    const accepted = c.accepted ?? 0;
    const rejected = c.rejected ?? 0;
    return {
      accepted,
      rejected,
      dismissed: c.dismissed ?? 0,
      acceptanceRate:
        accepted + rejected ? accepted / (accepted + rejected) : null,
    };
  }
  async processChunk({ userId, id }: { userId: string; id: string }) {
    const deadline = Date.now() + 15000;
    let nextId: string | undefined = id;
    // Bound each delivery so a large import yields to other users. The database
    // ledger provides continuation after the next dispatcher tick or a crash.
    for (
      let count = 0;
      count < 10 && nextId && Date.now() < deadline;
      count++
    ) {
      const result = await this.process({ userId, id: nextId });
      if (result?.localRateLimit) break;
      const next = await this.db.getRepository(ClassificationWork).findOne({
        where: {
          user_id: userId,
          status: 'queued',
          available_at: LessThanOrEqual(new Date()),
        },
        order: { created_at: 'ASC', id: 'ASC' },
      });
      nextId = next?.id;
    }
  }

  async process({
    userId,
    id,
  }: {
    userId: string;
    id: string;
  }): Promise<{ localRateLimit: true } | undefined> {
    const work = await this.db
      .getRepository(ClassificationWork)
      .findOneBy({ id, user_id: userId, status: 'queued' });
    if (!work || work.available_at.getTime() > Date.now()) return;
    const started = Date.now();
    const state = await this.db
      .getRepository(ClassificationState)
      .findOneBy({ user_id: userId });
    const transaction = await this.db.getRepository(Transaction).findOne({
      where: { id: work.transaction_id, account: { user_id: userId } },
    });
    if (
      !state ||
      !transaction ||
      transaction.categoryId ||
      transaction.revision !== work.transaction_revision
    ) {
      await this.finish(work, 'skipped', started);
      return;
    }
    let connection: DecisionConnection | null = null;
    let localRateLimit = false;
    try {
      const categories = await this.db
        .getRepository(Category)
        .findBy({ user_id: userId });
      const [rule] = await this.rules.evaluateTransactions({
        userId,
        transactions: [transaction],
        validCategoryIds: categories.map((c) => c.id),
      });
      let candidate: { categoryId: string; confidence: number | null } | null =
        null;
      let source: 'rule' | 'decision_api' = 'rule';
      let fingerprint: string;
      if (rule.categoryId && categories.some((c) => c.id === rule.categoryId)) {
        candidate = { categoryId: rule.categoryId, confidence: null };
        const definition = await this.rules.findOne({
          userId,
          id: rule.matchedRuleId!,
        });
        fingerprint = hash({
          source,
          definition: {
            id: definition.id,
            conditionLogic: definition.conditionLogic,
            conditions: definition.conditions.map(
              ({ field, operator, value, order }) => ({
                field,
                operator,
                value,
                order,
              }),
            ),
          },
          transaction: {
            description: transaction.description,
            notes: transaction.notes,
            amount: transaction.amount,
            date: transaction.date,
            accountId: transaction.accountId,
          },
          rule,
        });
      } else {
        source = 'decision_api';
        connection = await this.connections.get({ userId, secrets: true });
        if (!connection?.is_active) {
          await this.finish(work, 'skipped', started);
          return;
        }
        const options = buildOptions(categories);
        const input = buildState(transaction, connection.send_notes);
        if (!options.length || (!input.description && !input.notes)) {
          await this.finish(work, 'abstained', started);
          return;
        }
        fingerprint = hash({
          input,
          options,
          connection: connection.id,
          revision: connection.revision,
          model: connection.model,
          configRevision: state.revision,
          INSTRUCTIONS_VERSION,
          STATE_VERSION,
        });
        const previous = await this.db
          .getRepository(TransactionSuggestion)
          .findOneBy({
            user_id: userId,
            transaction_id: transaction.id,
            fingerprint,
            status: In(['pending', 'dismissed']),
          });
        if (previous) {
          await this.finish(work, 'skipped', started);
          return;
        }
        const currentConnection = connection;
        const scores = await this.client.scores(
          connection,
          this.connections.credentials(connection),
          input,
          options,
          async () => {
            const current = await this.connections.get({ userId });
            const currentTransaction = await this.db
              .getRepository(Transaction)
              .findOne({
                where: { id: transaction.id, account: { user_id: userId } },
              });
            if (
              !current?.is_active ||
              current.id !== currentConnection.id ||
              current.revision !== currentConnection.revision ||
              currentTransaction?.revision !== work.transaction_revision ||
              currentTransaction.categoryId
            )
              throw new StaleClassificationError();
            try {
              await this.limits.request({ userId, connectionId: current.id });
            } catch (error) {
              if (error instanceof DecisionError && error.code === 'rate_limit')
                localRateLimit = true;
              throw error;
            }
          },
        );
        candidate = resolveScores(
          options,
          scores,
          connection.min_confidence,
          connection.min_margin,
        );
      }
      await this.db.transaction(async (manager) => {
        // Same lock order as transaction mutation: transaction, configuration.
        const current = await manager
          .getRepository(Transaction)
          .createQueryBuilder('t')
          .innerJoin('t.account', 'a')
          .where('t.id = :id AND a.user_id = :userId', {
            id: transaction.id,
            userId,
          })
          .setLock('pessimistic_write', undefined, ['t'])
          .getOne();
        const config = await manager.findOne(ClassificationState, {
          where: { user_id: userId },
          lock: { mode: 'pessimistic_write' },
        });
        const pendingWork = await manager.findOne(ClassificationWork, {
          where: { id: work.id, user_id: userId, status: 'queued' },
          lock: { mode: 'pessimistic_write' },
        });
        if (!pendingWork) return;
        let outcome: ClassificationWork['status'] = 'skipped';
        if (
          current &&
          current.revision === work.transaction_revision &&
          !current.categoryId &&
          config?.revision === state.revision
        ) {
          const existing = await manager.findOne(TransactionSuggestion, {
            where: {
              user_id: userId,
              transaction_id: transaction.id,
              fingerprint,
              status: In(['pending', 'dismissed']),
            },
          });
          if (!existing) {
            await manager.update(
              TransactionSuggestion,
              {
                user_id: userId,
                transaction_id: transaction.id,
                status: 'pending',
              },
              { status: 'superseded' },
            );
            if (
              candidate &&
              categories.some((c) => c.id === candidate.categoryId)
            ) {
              await manager.insert(TransactionSuggestion, {
                user_id: userId,
                transaction_id: transaction.id,
                source,
                rule_id: source === 'rule' ? rule.matchedRuleId : null,
                connection_id: connection?.id ?? null,
                suggested_category_id: candidate.categoryId,
                confidence: candidate.confidence,
                fingerprint,
              });
              outcome = 'suggested';
            } else outcome = 'abstained';
          }
        }
        await manager.update(
          ClassificationWork,
          { id: work.id, user_id: userId },
          { status: outcome, latency_ms: Date.now() - started },
        );
      });
    } catch (error) {
      if (error instanceof StaleClassificationError) {
        await this.finish(work, 'skipped', started);
        return;
      }
      const code = error instanceof DecisionError ? error.code : 'unavailable';
      const attempts = work.attempts + (localRateLimit ? 0 : 1);
      const retry =
        localRateLimit ||
        (code === 'unavailable' && attempts < 3) ||
        (code === 'rate_limit' && attempts < 20);
      const delay =
        error instanceof DecisionError && code === 'rate_limit'
          ? error.retryAfterMs
          : [30000, 120000, 600000][Math.min(attempts - 1, 2)];
      if (connection && code === 'rate_limit')
        await this.limits.cooldown({
          userId,
          connectionId: connection.id,
          delay,
        });
      if (connection && (code === 'auth' || code === 'blocked'))
        await this.db.getRepository(DecisionConnection).update(
          {
            id: connection.id,
            user_id: userId,
            revision: connection.revision,
          },
          { is_active: false, last_test_status: code },
        );
      await this.db.getRepository(ClassificationWork).update(
        { id: work.id, user_id: userId, status: 'queued' },
        {
          status: retry ? 'queued' : 'failed',
          attempts,
          available_at: new Date(Date.now() + delay),
          error_code: code,
          latency_ms: Date.now() - started,
        },
      );
      if (localRateLimit) return { localRateLimit: true };
    }
  }
  private async finish(
    work: ClassificationWork,
    status: ClassificationWork['status'],
    started: number,
  ) {
    await this.db
      .getRepository(ClassificationWork)
      .update(
        { id: work.id, user_id: work.user_id, status: 'queued' },
        { status, latency_ms: Date.now() - started },
      );
  }
}
