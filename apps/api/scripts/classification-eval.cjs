/* Read-only evaluation against an explicitly authorised development dataset. */
const { writeFile } = require('node:fs/promises');
const { parseArgs } = require('node:util');
const { ConfigService } = require('@nestjs/config');
const { default: db } = require('../dist/database/data-source');
const { default: configuration } = require('../dist/configuration');
const {
  CredentialEncryptionService,
} = require('../dist/common/crypto/credential-encryption.service');
const {
  SafeHttpClient,
} = require('../dist/features/classification/http/safe-http-client');
const {
  JevClient,
} = require('../dist/features/classification/jev-client.service');
const {
  buildOptions,
  buildState,
  hash,
  resolveScores,
} = require('../dist/features/classification/classification.logic');
const {
  DecisionConnection,
} = require('../dist/features/classification/entities/decision-connection.entity');
const {
  Category,
} = require('../dist/features/categories/entities/category.entity');
const {
  Transaction,
} = require('../dist/features/transactions/entities/transaction.entity');

async function main() {
  const { values } = parseArgs({
    options: {
      user: { type: 'string' },
      limit: { type: 'string', default: '500' },
      seed: { type: 'string', default: '1' },
      output: { type: 'string', default: 'classification-evaluation' },
      'allow-send': { type: 'boolean', default: false },
    },
  });
  if (
    !values.user ||
    !values['allow-send'] ||
    process.env.ENVIRONMENT === 'production'
  )
    throw new Error(
      'Use --user <id> --allow-send with an authorised development dataset. Production is disabled.',
    );
  const limit = Number(values.limit);
  if (!Number.isInteger(limit) || limit < 2 || limit > 1000)
    throw new Error('Limit must be 2–1000');
  const config = new ConfigService(configuration());
  await db.initialize();
  try {
    const connection = await db
      .getRepository(DecisionConnection)
      .createQueryBuilder('c')
      .addSelect('c.encrypted_credentials')
      .where('c.user_id=:id', { id: values.user })
      .getOne();
    if (!connection) throw new Error('No connection for this user');
    const cipher = new CredentialEncryptionService(config);
    const credentials = connection.encrypted_credentials
      ? JSON.parse(cipher.decrypt(connection.encrypted_credentials))
      : {};
    const client = new JevClient(new SafeHttpClient(config), config);
    const options = buildOptions(
      await db.getRepository(Category).findBy({ user_id: values.user }),
    );
    if (!options.length) throw new Error('No category options');
    const transactions = await db
      .getRepository(Transaction)
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .where('a.user_id=:id AND t.categoryId IS NOT NULL', { id: values.user })
      .orderBy('t.date', 'DESC')
      .take(10000)
      .getMany();
    const groups = new Map();
    for (const transaction of transactions) {
      const state = buildState(transaction, connection.send_notes);
      const key = hash(state);
      const group = groups.get(key) ?? { key, state, labels: new Set() };
      group.labels.add(transaction.categoryId);
      groups.set(key, group);
    }
    // Conflicting labels cannot provide an unambiguous ground truth for text-only decisions.
    const conflicts = [...groups.values()].filter(
      (g) => g.labels.size !== 1,
    ).length;
    const rows = [...groups.values()]
      .filter((g) => g.labels.size === 1)
      .sort((a, b) =>
        hash([values.seed, a.key]).localeCompare(hash([values.seed, b.key])),
      )
      .slice(0, limit);
    if (rows.length < 2)
      throw new Error('Need at least two distinct labelled inputs');
    const scored = [];
    let requests = 0;
    for (const row of rows) {
      const started = Date.now();
      const scores = await client.scores(
        //NOSONAR -- Respect provider request budgets during evaluation.
        connection,
        credentials,
        row.state,
        options,
        async () => {
          requests++;
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              Math.ceil(
                60000 / config.getOrThrow('decision').requestsPerMinute,
              ),
            ),
          );
        },
      );
      scored.push({
        ...row,
        expected: [...row.labels][0],
        scores,
        latency: Date.now() - started,
      });
    }
    const split = Math.max(1, Math.floor(scored.length * 0.6));
    const tuning = scored.slice(0, split);
    const holdout = scored.slice(split);
    function measure(data, threshold, margin) {
      let predicted = 0;
      let correct = 0;
      for (const row of data) {
        const result = resolveScores(options, row.scores, threshold, margin);
        if (result) {
          predicted++;
          if (result.categoryId === row.expected) correct++;
        }
      }
      return {
        samples: data.length,
        predicted,
        correct,
        coverage: predicted / data.length,
        precision: predicted ? correct / predicted : 0,
      };
    }
    const candidates = [0.6, 0.7, 0.8, 0.9, 0.95].flatMap((threshold) =>
      [0.05, 0.1, 0.2, 0.3].map((margin) => ({
        threshold,
        margin,
        ...measure(tuning, threshold, margin),
      })),
    );
    candidates.sort(
      (a, b) =>
        Number(b.precision >= 0.95) - Number(a.precision >= 0.95) ||
        b.precision - a.precision ||
        b.coverage - a.coverage,
    );
    const chosen = candidates[0];
    const result = measure(holdout, chosen.threshold, chosen.margin);
    const latencies = scored.map((r) => r.latency).sort((a, b) => a - b);
    const confusions = new Map();
    for (const row of holdout) {
      const prediction =
        resolveScores(options, row.scores, chosen.threshold, chosen.margin)
          ?.categoryId ?? 'abstain';
      const key = `${row.expected},${prediction}`;
      confusions.set(key, (confusions.get(key) ?? 0) + 1);
    }
    const report = `# Classification evaluation\n\nSeed: ${values.seed}. Unique inputs: ${scored.length}. Conflicting input groups excluded: ${conflicts}.\n\nTuning samples: ${tuning.length}; holdout samples: ${holdout.length}. No shared normalized inputs.\n\nSelected threshold: ${chosen.threshold}; margin: ${chosen.margin}.\n\nHoldout precision: ${result.precision}; coverage: ${result.coverage}; correct: ${result.correct}/${result.predicted}. These estimates do not authorise automatic application.\n\nRequests: ${requests}; latency p50: ${latencies[Math.floor(latencies.length * 0.5)]} ms; p95: ${latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95))]} ms.\n\nGround truth is user categorisation. Parent categories excluded by the production option builder count as unsupported targets, not successful predictions. Recent-data sampling may not represent future transactions.\n`;
    await writeFile(`${values.output}.md`, report, { mode: 0o600 });
    await writeFile(
      `${values.output}.csv`,
      'expected_category_id,predicted_category_id,count\n' +
        [...confusions].map(([key, count]) => `${key},${count}`).join('\n') +
        '\n',
      { mode: 0o600 },
    );
    console.log(
      `Wrote ${values.output}.md and ${values.output}.csv; no transaction text included.`,
    );
  } finally {
    await db.destroy();
  }
}
main().catch(() => {
  console.error(
    'Evaluation failed. Check arguments, authorised data and connection settings.',
  );
  process.exitCode = 1;
});
