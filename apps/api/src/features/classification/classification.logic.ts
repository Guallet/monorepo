/* oxlint-disable no-control-regex -- Deliberately reject or strip control characters from outbound data. */
import { createHash } from 'node:crypto';

export const INSTRUCTIONS_VERSION = 1;
export const STATE_VERSION = 1;
export const hash = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function maskText(
  value: string | null | undefined,
  limit: number,
): string {
  return (value ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9 ]{11,60}\b/gi, '[iban]')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')
    .replace(/\d{6,}/g, '[number]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}
export function buildState(
  transaction: {
    description?: string | null;
    notes?: string | null;
    amount: number | string;
    currency: string;
  },
  sendNotes: boolean,
) {
  let type = 'neutral';
  if (Number(transaction.amount) > 0) type = 'income';
  else if (Number(transaction.amount) < 0) type = 'expense';
  return {
    description: maskText(transaction.description, 300),
    ...(sendNotes ? { notes: maskText(transaction.notes, 500) } : {}),
    type,
    currency: transaction.currency,
  };
}
export type CategoryInput = {
  id: string;
  name: string;
  parentId?: string | null;
};
export type CategoryOption = { key: string; categoryId: string; label: string };
export function buildOptions(categories: CategoryInput[]): CategoryOption[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  // Invalid ancestry becomes a root; cycles must not silently remove every option.
  const parent = new Map<string, string>();
  for (const c of categories) {
    let current = c;
    const seen = new Set([c.id]);
    let valid = true;
    while (current.parentId && byId.has(current.parentId)) {
      if (seen.has(current.parentId)) {
        valid = false;
        break;
      }
      seen.add(current.parentId);
      current = byId.get(current.parentId)!;
    }
    if (valid && c.parentId && byId.has(c.parentId))
      parent.set(c.id, c.parentId);
  }
  const parents = new Set(parent.values());
  return categories
    .filter((c) => !parents.has(c.id))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((c, index) => {
      const labels = [c.name];
      let id = parent.get(c.id);
      while (id) {
        labels.unshift(byId.get(id)!.name);
        id = parent.get(id);
      }
      return {
        key: `q${index}`,
        categoryId: c.id,
        label: labels
          .map((s) => s.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 64))
          .join(' > '),
      };
    });
}
export function resolveScores(
  options: CategoryOption[],
  scores: Record<string, number>,
  threshold: number,
  margin: number,
) {
  const keys = Object.keys(scores);
  if (
    keys.length !== options.length ||
    options.some(
      (o) =>
        !Object.prototype.hasOwnProperty.call(scores, o.key) || //NOSONAR -- The configured TS lib predates Object.hasOwn.
        !Number.isFinite(scores[o.key]) ||
        scores[o.key] < 0 ||
        scores[o.key] > 1,
    )
  )
    throw new Error('Invalid decision answers');
  const ranked = options
    .map((o) => ({ ...o, score: scores[o.key] }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0];
  if (
    !top ||
    top.score < threshold ||
    top.score === ranked[1]?.score ||
    top.score - (ranked[1]?.score ?? 0) + Number.EPSILON < margin
  )
    return null;
  return { categoryId: top.categoryId, confidence: top.score };
}
