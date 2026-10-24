import {
  buildOptions,
  buildState,
  hash,
  maskText,
  resolveScores,
} from './classification.logic';
import { evaluateCondition } from '../rules/engine/rules-engine';
import { Transaction } from '../transactions/entities/transaction.entity';

describe('classification decisions', () => {
  const options = buildOptions([
    { id: 'a', name: 'Groceries' },
    { id: 'b', name: 'Travel' },
  ]);
  it('masks identifiers before truncation and only shares notes when enabled', () => {
    expect(maskText(' card 123456789 email me@example.com ', 300)).toBe(
      'card [number] email [email]',
    );
    expect(maskText('GB82 WEST 1234 5698 7654 32', 300)).toBe('[iban]');
    expect(maskText('TESCO 3412', 300)).toBe('TESCO 3412');
    const tx = {
      description: '  SHOP\n HERE ',
      notes: 'private',
      amount: '-1.01',
      currency: 'GBP',
    };
    expect(buildState(tx, false)).toEqual({
      description: 'SHOP HERE',
      type: 'expense',
      currency: 'GBP',
    });
    expect(buildState(tx, true).notes).toBe('private');
  });
  it('uses deterministic leaf options and fingerprints labels and ancestry', () => {
    const categories = [
      { id: 'a', name: 'Food' },
      { id: 'b', name: 'Groceries', parentId: 'a' },
      { id: 'c', name: 'Transfer' },
    ];
    expect(buildOptions(categories)).toEqual([
      { key: 'q0', categoryId: 'b', label: 'Food > Groceries' },
      { key: 'q1', categoryId: 'c', label: 'Transfer' },
    ]);
    expect(buildOptions([...categories].reverse())).toEqual(
      buildOptions(categories),
    );
    expect(hash(buildOptions(categories))).not.toBe(
      hash(
        buildOptions([
          { ...categories[0], name: 'Meals' },
          ...categories.slice(1),
        ]),
      ),
    );
    expect(
      buildOptions([
        { id: 'a', name: 'A', parentId: 'b' },
        { id: 'b', name: 'B', parentId: 'a' },
      ]),
    ).toHaveLength(2);
    expect(
      buildOptions([{ id: 'a', name: 'A', parentId: 'missing' }]),
    ).toHaveLength(1);
  });
  it('abstains on ambiguous, tied and low scores; accepts inclusive thresholds', () => {
    expect(resolveScores(options, { q0: 0.9, q1: 0.8 }, 0.7, 0.2)).toBeNull();
    expect(resolveScores(options, { q0: 0.9, q1: 0.9 }, 0.7, 0)).toBeNull();
    expect(resolveScores(options, { q0: 0.6, q1: 0.2 }, 0.7, 0.1)).toBeNull();
    expect(resolveScores(options, { q0: 0.75, q1: 0.5 }, 0.75, 0.25)).toEqual({
      categoryId: 'a',
      confidence: 0.75,
    });
  });
  it.each([
    { q0: 0.9 },
    { q0: 0.9, q1: 0.1, unknown: 0.5 },
    { q0: NaN, q1: 0 },
    { q0: 1.01, q1: 0 },
  ])('rejects incomplete or malformed answers %j', (scores) => {
    expect(() =>
      resolveScores(options, scores as Record<string, number>, 0.7, 0.1),
    ).toThrow();
  });
  it('evaluates notes using the existing string operators', () => {
    expect(
      evaluateCondition({ notes: 'weekly shopping' } as Transaction, {
        id: 'condition',
        field: 'notes',
        operator: 'contains',
        value: 'shopping',
        order: 0,
      }),
    ).toBe(true);
    expect(
      evaluateCondition({ notes: null } as Transaction, {
        id: 'condition',
        field: 'notes',
        operator: 'contains',
        value: 'shopping',
        order: 0,
      }),
    ).toBe(false);
  });
});
