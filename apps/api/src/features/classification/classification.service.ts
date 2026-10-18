import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager, In, LessThanOrEqual } from 'typeorm';
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
class LocalRateLimitError extends DecisionError {
  constructor(retryAfterMs: number) {
    super('rate_limit', retryAfterMs);
  }
}

type ClassificationResult =
  | { kind: 'complete'; status: 'skipped' | 'abstained' }
  | {
      kind: 'candidate';
      candidate: { categoryId: string; confidence: number | null } | null;
      categories: Category[];
      connection: DecisionConnection | null;
      fingerprint: string;
      matchedRuleId: string | null;
      source: 'rule' | 'decision_api';
    };

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
    await this.db.transaction((manager) =>
      this.enqueueRun(manager, userId, dto, runId),
    );
    return this.status({ userId, runId });
  }

  private async enqueueRun(
    manager: EntityManager,
    userId: string,
    dto: ClassificationRunRequestDto,
    runId: string,
  ) {
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
    const transactions = dto.transactionIds
      ? await this.findRequestedTransactions(
          manager,
          userId,
          dto.transactionIds,
        )
      : await this.findInboxTransactions(manager, userId, state);
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
  }

  private async findRequestedTransactions(
    manager: EntityManager,
    userId: string,
    transactionIds: string[],
  ) {
    return manager
      .getRepository(Transaction)
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .where('a.user_id = :userId', { userId })
      .andWhere('t.categoryId IS NULL')
      .andWhere('t.id IN (:...ids)', { ids: transactionIds })
      .orderBy('t.id')
      .take(10000)
      .getMany();
  }

  private async findInboxTransactions(
    manager: EntityManager,
    userId: string,
    state: ClassificationState | null,
  ) {
    const query = () =>
      manager
        .getRepository(Transaction)
        .createQueryBuilder('t')
        .innerJoin('t.account', 'a')
        .where('a.user_id = :userId', { userId })
        .andWhere('t.categoryId IS NULL');
    const cursor = state?.inbox_cursor;
    let page = await query()
      .andWhere(cursor ? 't.id > :cursor' : 'TRUE', { cursor })
      .orderBy('t.id')
      .take(10001)
      .getMany();
    if (cursor && !page.length)
      page = await query().orderBy('t.id').take(10001).getMany();
    const transactions = page.slice(0, 10000);
    if (transactions.length && state) {
      state.inbox_cursor =
        page.length > 10000
          ? transactions[transactions.length - 1].id //NOSONAR -- Array.at is unavailable in the configured TS lib.
          : null;
      await manager.save(state);
    }
    return transactions;
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
      const result = await this.process({ userId, id: nextId }); //NOSONAR -- Stop this user's chunk immediately on budget refusal.
      if (result?.localRateLimit) break;
      const next = await this.db.getRepository(ClassificationWork).findOne({
        //NOSONAR -- Fetch the next durable item after this item's status changes.
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

  async process({ userId, id }: { userId: string; id: string }) {
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
    try {
      const result = await this.classifyWork({
        userId,
        work,
        state,
        transaction,
        setConnection: (value) => {
          connection = value;
        },
      });
      if (result.kind === 'complete') {
        await this.finish(work, result.status, started);
        return;
      }
      await this.persistCandidate({
        userId,
        work,
        state,
        transaction,
        result,
        started,
      });
    } catch (error) {
      await this.handleProcessingError({
        userId,
        work,
        connection,
        error,
        started,
      });
      if (error instanceof LocalRateLimitError)
        return { localRateLimit: true as const };
    }
  }

  private async classifyWork({
    userId,
    work,
    state,
    transaction,
    setConnection,
  }: {
    userId: string;
    work: ClassificationWork;
    state: ClassificationState;
    transaction: Transaction;
    setConnection: (connection: DecisionConnection | null) => void;
  }): Promise<ClassificationResult> {
    const categories = await this.db
      .getRepository(Category)
      .findBy({ user_id: userId });
    const [rule] = await this.rules.evaluateTransactions({
      userId,
      transactions: [transaction],
      validCategoryIds: categories.map((category) => category.id),
    });
    const ruleResult = await this.classifyByRule({
      userId,
      transaction,
      rule,
      categories,
    });
    if (ruleResult) return ruleResult;
    return this.classifyByProvider({
      userId,
      work,
      state,
      transaction,
      categories,
      setConnection,
    });
  }

  private async classifyByRule({
    userId,
    transaction,
    rule,
    categories,
  }: {
    userId: string;
    transaction: Transaction;
    rule: Awaited<ReturnType<RulesService['evaluateTransactions']>>[number];
    categories: Category[];
  }): Promise<ClassificationResult | null> {
    if (
      !rule.categoryId ||
      !categories.some((category) => category.id === rule.categoryId)
    )
      return null;
    const definition = await this.rules.findOne({
      userId,
      id: rule.matchedRuleId!,
    });
    const fingerprint = hash({
      source: 'rule',
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
    return {
      kind: 'candidate',
      candidate: { categoryId: rule.categoryId, confidence: null },
      categories,
      connection: null,
      fingerprint,
      matchedRuleId: rule.matchedRuleId,
      source: 'rule',
    };
  }

  private async classifyByProvider({
    userId,
    work,
    state,
    transaction,
    categories,
    setConnection,
  }: {
    userId: string;
    work: ClassificationWork;
    state: ClassificationState;
    transaction: Transaction;
    categories: Category[];
    setConnection: (connection: DecisionConnection | null) => void;
  }): Promise<ClassificationResult> {
    const connection = await this.connections.get({ userId, secrets: true });
    setConnection(connection);
    if (!connection?.is_active) return { kind: 'complete', status: 'skipped' };
    const options = buildOptions(categories);
    const input = buildState(transaction, connection.send_notes);
    if (!options.length || (!input.description && !input.notes))
      return { kind: 'complete', status: 'abstained' };
    const fingerprint = hash({
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
    if (previous) return { kind: 'complete', status: 'skipped' };
    const scores = await this.requestScores({
      userId,
      work,
      transaction,
      connection,
      input,
      options,
    });
    return {
      kind: 'candidate',
      candidate: resolveScores(
        options,
        scores,
        connection.min_confidence,
        connection.min_margin,
      ),
      categories,
      connection,
      fingerprint,
      matchedRuleId: null,
      source: 'decision_api',
    };
  }

  private async requestScores({
    userId,
    work,
    transaction,
    connection,
    input,
    options,
  }: {
    userId: string;
    work: ClassificationWork;
    transaction: Transaction;
    connection: DecisionConnection;
    input: ReturnType<typeof buildState>;
    options: ReturnType<typeof buildOptions>;
  }) {
    return this.client.scores(
      connection,
      this.connections.credentials(connection),
      input,
      options,
      async () => {
        await this.assertFreshInputs({ userId, work, transaction, connection });
        try {
          await this.limits.request({ userId, connectionId: connection.id });
        } catch (error) {
          if (error instanceof DecisionError && error.code === 'rate_limit')
            throw new LocalRateLimitError(error.retryAfterMs);
          throw error;
        }
      },
    );
  }

  private async assertFreshInputs({
    userId,
    work,
    transaction,
    connection,
  }: {
    userId: string;
    work: ClassificationWork;
    transaction: Transaction;
    connection: DecisionConnection;
  }) {
    const [currentConnection, currentTransaction] = await Promise.all([
      this.connections.get({ userId }),
      this.db.getRepository(Transaction).findOne({
        where: { id: transaction.id, account: { user_id: userId } },
      }),
    ]);
    if (
      !currentConnection?.is_active ||
      currentConnection.id !== connection.id ||
      currentConnection.revision !== connection.revision ||
      !currentTransaction ||
      currentTransaction.revision !== work.transaction_revision ||
      currentTransaction.categoryId
    )
      throw new StaleClassificationError();
  }

  private async persistCandidate({
    userId,
    work,
    state,
    transaction,
    result,
    started,
  }: {
    userId: string;
    work: ClassificationWork;
    state: ClassificationState;
    transaction: Transaction;
    result: Extract<ClassificationResult, { kind: 'candidate' }>;
    started: number;
  }) {
    await this.db.transaction(async (manager) => {
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
      if (this.canPersist(current, config, state, work))
        outcome = await this.storeSuggestion(
          manager,
          userId,
          transaction,
          result,
        );
      await manager.update(
        ClassificationWork,
        { id: work.id, user_id: userId },
        { status: outcome, latency_ms: Date.now() - started },
      );
    });
  }

  private canPersist(
    transaction: Transaction | null,
    currentState: ClassificationState | null,
    originalState: ClassificationState,
    work: ClassificationWork,
  ) {
    return Boolean(
      transaction &&
      !transaction.categoryId &&
      transaction.revision === work.transaction_revision &&
      currentState?.revision === originalState.revision,
    );
  }

  private async storeSuggestion(
    manager: EntityManager,
    userId: string,
    transaction: Transaction,
    result: Extract<ClassificationResult, { kind: 'candidate' }>,
  ): Promise<ClassificationWork['status']> {
    const existing = await manager.findOne(TransactionSuggestion, {
      where: {
        user_id: userId,
        transaction_id: transaction.id,
        fingerprint: result.fingerprint,
        status: In(['pending', 'dismissed']),
      },
    });
    if (existing) return 'skipped';
    await manager.update(
      TransactionSuggestion,
      { user_id: userId, transaction_id: transaction.id, status: 'pending' },
      { status: 'superseded' },
    );
    if (
      !result.candidate ||
      !result.categories.some(
        (category) => category.id === result.candidate?.categoryId,
      )
    )
      return 'abstained';
    await manager.insert(TransactionSuggestion, {
      user_id: userId,
      transaction_id: transaction.id,
      source: result.source,
      rule_id: result.matchedRuleId,
      connection_id: result.connection?.id ?? null,
      suggested_category_id: result.candidate.categoryId,
      confidence: result.candidate.confidence,
      fingerprint: result.fingerprint,
    });
    return 'suggested';
  }

  private async handleProcessingError({
    userId,
    work,
    connection,
    error,
    started,
  }: {
    userId: string;
    work: ClassificationWork;
    connection: DecisionConnection | null;
    error: unknown;
    started: number;
  }) {
    if (error instanceof StaleClassificationError) {
      await this.finish(work, 'skipped', started);
      return;
    }
    const code = error instanceof DecisionError ? error.code : 'unavailable';
    const localRateLimit = error instanceof LocalRateLimitError;
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
      await this.db
        .getRepository(DecisionConnection)
        .update(
          { id: connection.id, user_id: userId, revision: connection.revision },
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
