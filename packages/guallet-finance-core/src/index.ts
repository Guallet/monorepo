import type { Pool, QueryResultRow } from 'pg';

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

export interface PageInput {
  page?: number;
  pageSize?: number;
}

export interface PageMeta extends Required<PageInput> {
  total: number;
  hasMore: boolean;
}

export interface PagedResult<T> {
  meta: PageMeta;
  items: T[];
}

export interface AccountReadModel {
  id: string;
  name: string;
  balance: { amount: number; currency: string };
  currency: string;
  type: string;
  institutionId: string | null;
  institutionName?: string;
  source?: string;
  sourceName?: string | null;
  properties?: unknown;
}

export interface TransactionReadModel {
  id: string;
  accountId: string;
  description: string | null;
  notes: string | null;
  amount: number;
  currency: string;
  date: string;
  categoryId: string | null;
  categoryName?: string | null;
}

export interface CategoryReadModel {
  id: string;
  name: string;
  icon: string | null;
  colour: string | null;
  parentId: string | null;
}

export interface RuleReadModel {
  id: string;
  name: string;
  description: string | null;
  resultCategoryId: string;
  order: number;
  isActive: boolean;
  conditionLogic: string;
  conditions: Array<{
    id: string;
    field: string;
    operator: string;
    value: string;
    order: number;
  }>;
}

export interface BudgetReadModel {
  id: string;
  name: string;
  amount: number;
  currency: string;
  spent: number;
  colour: string | null;
  icon: string | null;
  categories: string[];
  month: number;
  year: number;
}

export interface SavingGoalReadModel {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  targetDate: string | null;
  accounts: string[];
  currentAmount: number;
  progressPercentage: number;
  isCompleted: boolean;
  isOverdue: boolean;
  remainingAmount: number;
  daysRemaining: number | null;
}

export interface RegularPaymentReadModel {
  id: string;
  userId: string;
  type: string;
  name: string;
  amount: number;
  currency: string;
  cadence: string;
  startDate: string | null;
  imageUrl: string | null;
  categoryId: string | null;
}

export interface NotificationReadModel {
  id: string;
  message: string;
  icon: string | null;
  type: string;
  action: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ConnectionReadModel {
  id: string;
  created: string;
  status: string;
  institutionId: string;
  institutionName: string | null;
  accountCount: number;
}

export interface CashFlowReadModel {
  year: number;
  totalTransactions: number;
  data: Array<{
    categoryId: string | null;
    categoryName: string;
    isParent: boolean;
    totalTransactions: number;
    values: string[];
    subcategories: Array<{
      categoryId: string;
      categoryName: string;
      totalTransactions: number;
      values: string[];
    }>;
  }>;
}

export interface TransactionFilters extends PageInput {
  accountIds?: string[];
  categoryIds?: string[];
  startDate?: Date;
  endDate?: Date;
}

export class FinanceReadService {
  constructor(private readonly pool: Pool) {}

  async listAccounts(
    userId: string,
    input: PageInput = {},
  ): Promise<PagedResult<AccountReadModel>> {
    const page = normalizePage(input);
    const [rows, count] = await Promise.all([
      this.pool.query<AccountRow>(
        `SELECT a.id, a.name, a.balance, a.currency, a.type, a."institutionId",
                a.source, a.source_name, a.properties, i.name AS institution_name
           FROM accounts a
           LEFT JOIN institutions i ON i.id = a."institutionId"
          WHERE a.user_id = $1
          ORDER BY a.name ASC, a.id ASC
          LIMIT $2 OFFSET $3`,
        [userId, page.pageSize, (page.page - 1) * page.pageSize],
      ),
      this.pool.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM accounts WHERE user_id = $1',
        [userId],
      ),
    ]);

    return paged(rows.rows.map(mapAccount), count.rows[0]?.count ?? '0', page);
  }

  async getAccount(userId: string, accountId: string) {
    const result = await this.pool.query<AccountRow>(
      `SELECT a.id, a.name, a.balance, a.currency, a.type, a."institutionId",
              a.source, a.source_name, a.properties, i.name AS institution_name
         FROM accounts a
         LEFT JOIN institutions i ON i.id = a."institutionId"
        WHERE a.user_id = $1 AND a.id = $2`,
      [userId, accountId],
    );
    return result.rows[0] ? mapAccount(result.rows[0]) : null;
  }

  async listTransactions(
    userId: string,
    input: TransactionFilters = {},
  ): Promise<PagedResult<TransactionReadModel>> {
    const page = normalizePage(input);
    const values: unknown[] = [userId];
    const filters = ['a.user_id = $1'];
    if (input.accountIds?.length) {
      values.push(input.accountIds);
      filters.push(`t."accountId" = ANY($${values.length}::uuid[])`);
    }
    if (input.categoryIds?.length) {
      values.push(input.categoryIds);
      filters.push(`t."categoryId" = ANY($${values.length}::uuid[])`);
    }
    if (input.startDate) {
      values.push(input.startDate);
      filters.push(`t.date >= $${values.length}`);
    }
    if (input.endDate) {
      values.push(input.endDate);
      filters.push(`t.date < $${values.length}`);
    }
    const where = filters.join(' AND ');
    const dataValues = [
      ...values,
      page.pageSize,
      (page.page - 1) * page.pageSize,
    ];
    const [rows, count] = await Promise.all([
      this.pool.query<TransactionRow>(
        `SELECT t.id, t."accountId", t.description, t.notes, t.amount, t.currency,
                t.date, t."categoryId", c.name AS category_name
           FROM transactions t
           JOIN accounts a ON a.id = t."accountId"
           LEFT JOIN categories c ON c.id = t."categoryId" AND c.user_id = a.user_id
          WHERE ${where}
          ORDER BY t.date DESC, t.id DESC
          LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
        dataValues,
      ),
      this.pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
           FROM transactions t
           JOIN accounts a ON a.id = t."accountId"
          WHERE ${where}`,
        values,
      ),
    ]);
    return paged(
      rows.rows.map(mapTransaction),
      count.rows[0]?.count ?? '0',
      page,
    );
  }

  async getTransaction(userId: string, transactionId: string) {
    const result = await this.pool.query<TransactionRow>(
      `SELECT t.id, t."accountId", t.description, t.notes, t.amount, t.currency,
              t.date, t."categoryId", c.name AS category_name
         FROM transactions t
         JOIN accounts a ON a.id = t."accountId"
         LEFT JOIN categories c ON c.id = t."categoryId" AND c.user_id = a.user_id
        WHERE a.user_id = $1 AND t.id = $2`,
      [userId, transactionId],
    );
    return result.rows[0] ? mapTransaction(result.rows[0]) : null;
  }

  async listCategories(userId: string, input: PageInput = {}) {
    const page = normalizePage(input);
    const [rows, count] = await Promise.all([
      this.pool.query<CategoryRow>(
        `SELECT id, name, icon, colour, "parentId"
           FROM categories WHERE user_id = $1
          ORDER BY name ASC, id ASC LIMIT $2 OFFSET $3`,
        [userId, page.pageSize, (page.page - 1) * page.pageSize],
      ),
      this.pool.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM categories WHERE user_id = $1',
        [userId],
      ),
    ]);
    return paged(rows.rows.map(mapCategory), count.rows[0]?.count ?? '0', page);
  }

  async listRules(userId: string, input: PageInput = {}) {
    const page = normalizePage(input);
    const [rules, count] = await Promise.all([
      this.pool.query<RuleRow>(
        `SELECT r.id, r.name, r.description, r.result_category_id,
                r."order", r.is_active, r.condition_logic,
                COALESCE(json_agg(json_build_object(
                  'id', c.id, 'field', c.field, 'operator', c.operator,
                  'value', c.value, 'order', c."order"
                ) ORDER BY c."order") FILTER (WHERE c.id IS NOT NULL), '[]') AS conditions
           FROM categorization_rules r
           LEFT JOIN rule_conditions c ON c."ruleId" = r.id
          WHERE r.user_id = $1
          GROUP BY r.id
          ORDER BY r."order" ASC, r.id ASC LIMIT $2 OFFSET $3`,
        [userId, page.pageSize, (page.page - 1) * page.pageSize],
      ),
      this.pool.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM categorization_rules WHERE user_id = $1',
        [userId],
      ),
    ]);
    return paged(rules.rows.map(mapRule), count.rows[0]?.count ?? '0', page);
  }

  async getBudget(
    userId: string,
    budgetId: string,
    month: number,
    year: number,
  ) {
    const result = await this.listBudgets(userId, { month, year, budgetId });
    return result[0] ?? null;
  }

  async listBudgets(
    userId: string,
    input: PageInput & { month: number; year: number; budgetId?: string },
  ): Promise<BudgetReadModel[]> {
    const page = normalizePage(input);
    const end = new Date(Date.UTC(input.year, input.month + 1, 1));
    const start = new Date(Date.UTC(input.year, input.month, 1));
    const values: unknown[] = [userId, start, end];
    const idFilter = input.budgetId ? ' AND b.id = $4' : '';
    if (input.budgetId) values.push(input.budgetId);
    const result = await this.pool.query<BudgetRow>(
      `SELECT b.id, b.name, b.amount, b.currency, b.colour, b.icon,
              COALESCE(array_agg(DISTINCT bc.category_id) FILTER (WHERE bc.category_id IS NOT NULL), '{}') AS categories,
              COALESCE(SUM(CASE WHEN a.id IS NOT NULL THEN t.amount ELSE 0 END), 0) AS spent
         FROM budgets b
         LEFT JOIN budget_categories bc ON bc.budget_id = b.id
         LEFT JOIN transactions t ON t."categoryId" = bc.category_id
          AND t.date >= $2 AND t.date < $3
         LEFT JOIN accounts a ON a.id = t."accountId" AND a.user_id = b.user_id
        WHERE b.user_id = $1${idFilter}
        GROUP BY b.id
        ORDER BY b.name ASC, b.id ASC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, page.pageSize, (page.page - 1) * page.pageSize],
    );
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      amount: number(row.amount),
      currency: row.currency,
      spent: number(row.spent),
      colour: row.colour,
      icon: row.icon,
      categories: row.categories ?? [],
      month: input.month,
      year: input.year,
    }));
  }

  async getSavingGoal(userId: string, goalId: string) {
    const result = await this.listSavingGoals(userId, goalId);
    return result.items[0] ?? null;
  }

  async listSavingGoals(
    userId: string,
    goalId?: string,
    input: PageInput = {},
  ): Promise<PagedResult<SavingGoalReadModel>> {
    const page = normalizePage(input);
    const values: unknown[] = [userId];
    const filter = goalId ? ' AND sg.id = $2' : '';
    if (goalId) values.push(goalId);
    const result = await this.pool.query<SavingGoalRow>(
      `SELECT sg.id, sg.name, sg.description, sg.target_amount, sg.target_date,
              sg.accounts, COALESCE(SUM(a.balance), 0) AS current_amount
         FROM saving_goals sg
         LEFT JOIN accounts a ON a.user_id = sg."userId"
          AND a.id = ANY(string_to_array(sg.accounts, ','))
        WHERE sg."userId" = $1${filter}
        GROUP BY sg.id ORDER BY sg.priority ASC NULLS LAST, sg.name ASC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, page.pageSize, (page.page - 1) * page.pageSize],
    );
    const count = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM saving_goals sg
        WHERE sg."userId" = $1${filter}`,
      values,
    );
    return paged(
      result.rows.map(mapSavingGoal),
      count.rows[0]?.count ?? '0',
      page,
    );
  }

  async getRegularPayment(userId: string, id: string) {
    const result = await this.listRegularPayments(userId, id);
    return result.items[0] ?? null;
  }

  async listRegularPayments(
    userId: string,
    id?: string,
    input: PageInput = {},
  ): Promise<PagedResult<RegularPaymentReadModel>> {
    const page = normalizePage(input);
    const values: unknown[] = [userId];
    const filter = id ? ' AND rp.id = $2' : '';
    if (id) values.push(id);
    const result = await this.pool.query<RegularPaymentRow>(
      `SELECT rp.id, rp.user_id, rp.type, rp.name, rp.amount, rp.currency,
              rp.cadence, rp."startDate", rp."imageUrl", rp."categoryId"
         FROM regular_payments rp WHERE rp.user_id = $1${filter}
        ORDER BY rp.name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, page.pageSize, (page.page - 1) * page.pageSize],
    );
    const count = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM regular_payments rp
        WHERE rp.user_id = $1${filter}`,
      values,
    );
    return paged(
      result.rows.map(mapRegularPayment),
      count.rows[0]?.count ?? '0',
      page,
    );
  }

  async listNotifications(userId: string, input: PageInput = {}) {
    const page = normalizePage(input);
    const [rows, count] = await Promise.all([
      this.pool.query<NotificationRow>(
        `SELECT id, message, icon, type, action, is_read, created_at
           FROM notifications WHERE user_id = $1
          ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
        [userId, page.pageSize, (page.page - 1) * page.pageSize],
      ),
      this.pool.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1',
        [userId],
      ),
    ]);
    return paged(
      rows.rows.map(mapNotification),
      count.rows[0]?.count ?? '0',
      page,
    );
  }

  async listConnections(userId: string, input: PageInput = {}) {
    const page = normalizePage(input);
    const [result, count] = await Promise.all([
      this.pool.query<ConnectionRow>(
        `SELECT r.id, r.created, r.status, r.institution_id, i.name AS institution_name,
                COALESCE(cardinality(string_to_array(r.accounts, ',')), 0) AS account_count
           FROM nordigen_requisitions r
           LEFT JOIN institutions i ON i.nordigen_id = r.institution_id
          WHERE r.user_id = $1 ORDER BY r.created DESC, r.id DESC
          LIMIT $2 OFFSET $3`,
        [userId, page.pageSize, (page.page - 1) * page.pageSize],
      ),
      this.pool.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM nordigen_requisitions WHERE user_id = $1',
        [userId],
      ),
    ]);
    return paged(
      result.rows.map((row) => ({
        id: row.id,
        created: date(row.created),
        status: row.status,
        institutionId: row.institution_id,
        institutionName: row.institution_name,
        accountCount: Number(row.account_count ?? 0),
      })),
      count.rows[0]?.count ?? '0',
      page,
    );
  }

  async getConnection(userId: string, id: string) {
    const result = await this.pool.query<ConnectionRow>(
      `SELECT r.id, r.created, r.status, r.institution_id, i.name AS institution_name,
              COALESCE(cardinality(string_to_array(r.accounts, ',')), 0) AS account_count
         FROM nordigen_requisitions r
         LEFT JOIN institutions i ON i.nordigen_id = r.institution_id
        WHERE r.user_id = $1 AND r.id = $2`,
      [userId, id],
    );
    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          created: date(row.created),
          status: row.status,
          institutionId: row.institution_id,
          institutionName: row.institution_name,
          accountCount: Number(row.account_count ?? 0),
        }
      : null;
  }

  async cashFlow(userId: string, year: number): Promise<CashFlowReadModel> {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    const result = await this.pool.query<CashFlowRow>(
      `SELECT c.id AS category_id, c.name AS category_name, c."parentId" AS parent_id,
              EXTRACT(MONTH FROM t.date)::int - 1 AS month,
              COUNT(*)::int AS transaction_count, COALESCE(SUM(t.amount), 0) AS total
         FROM transactions t
         JOIN accounts a ON a.id = t."accountId"
         LEFT JOIN categories c ON c.id = t."categoryId"
        WHERE a.user_id = $1 AND t.date >= $2 AND t.date < $3
        GROUP BY c.id, c.name, c."parentId", month
        ORDER BY c.name NULLS LAST`,
      [userId, start, end],
    );
    const total = result.rows.reduce(
      (sum, row) => sum + Number(row.transaction_count),
      0,
    );
    const grouped = new Map<string, CashFlowReadModel['data'][number]>();
    for (const row of result.rows) {
      const key = row.category_id ?? 'uncategorized';
      const existing = grouped.get(key) ?? {
        categoryId: row.category_id,
        categoryName: row.category_name ?? 'Uncategorized',
        isParent: row.parent_id === null,
        totalTransactions: 0,
        values: Array.from({ length: 12 }, () => '0.00'),
        subcategories: [],
      };
      existing.totalTransactions += Number(row.transaction_count);
      existing.values[Number(row.month)] = Number(row.total).toFixed(2);
      grouped.set(key, existing);
    }
    return { year, totalTransactions: total, data: [...grouped.values()] };
  }
}

export function normalizePage(input: PageInput): Required<PageInput> {
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(input.pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  return { page, pageSize };
}

function paged<T>(
  items: T[],
  rawCount: string,
  page: Required<PageInput>,
): PagedResult<T> {
  const total = Number(rawCount);
  return {
    items,
    meta: { ...page, total, hasMore: page.page * page.pageSize < total },
  };
}

const number = (value: unknown) => Number(value ?? 0);
const date = (value: unknown) => new Date(value as string | Date).toISOString();

type AccountRow = QueryResultRow & {
  id: string;
  name: string;
  balance: unknown;
  currency: string;
  type: string;
  institutionId: string | null;
  source: string;
  source_name: string | null;
  properties: unknown;
  institution_name?: string | null;
};
type TransactionRow = QueryResultRow & {
  id: string;
  accountId: string;
  description: string | null;
  notes: string | null;
  amount: unknown;
  currency: string;
  date: string | Date;
  categoryId: string | null;
  category_name?: string | null;
};
type CategoryRow = QueryResultRow & {
  id: string;
  name: string;
  icon: string | null;
  colour: string | null;
  parentId: string | null;
};
type RuleRow = QueryResultRow & {
  id: string;
  name: string;
  description: string | null;
  result_category_id: string;
  order: number;
  is_active: boolean;
  condition_logic: string;
  conditions: RuleReadModel['conditions'];
};
type BudgetRow = QueryResultRow & {
  id: string;
  name: string;
  amount: unknown;
  currency: string;
  spent: unknown;
  colour: string | null;
  icon: string | null;
  categories: string[];
};
type SavingGoalRow = QueryResultRow & {
  id: string;
  name: string;
  description: string | null;
  target_amount: unknown;
  target_date: string | Date | null;
  accounts: string[] | string;
  current_amount: unknown;
};
type RegularPaymentRow = QueryResultRow & {
  id: string;
  user_id: string;
  type: string;
  name: string;
  amount: unknown;
  currency: string;
  cadence: string;
  startDate: string | Date | null;
  imageUrl: string | null;
  categoryId: string | null;
};
type NotificationRow = QueryResultRow & {
  id: string;
  message: string;
  icon: string | null;
  type: string;
  action: string | null;
  is_read: boolean;
  created_at: string | Date;
};
type ConnectionRow = QueryResultRow & {
  id: string;
  created: string | Date;
  status: string;
  institution_id: string;
  institution_name: string | null;
  account_count: number;
};
type CashFlowRow = QueryResultRow & {
  category_id: string | null;
  category_name: string | null;
  parent_id: string | null;
  month: number;
  transaction_count: number;
  total: unknown;
};

function mapAccount(row: AccountRow): AccountReadModel {
  return {
    id: row.id,
    name: row.name,
    balance: { amount: number(row.balance), currency: row.currency },
    currency: row.currency,
    type: row.type,
    institutionId: row.institutionId,
    institutionName: row.institution_name ?? undefined,
    source: row.source,
    sourceName: row.source_name,
    properties: row.properties,
  };
}

function mapTransaction(row: TransactionRow): TransactionReadModel {
  return {
    id: row.id,
    accountId: row.accountId,
    description: row.description,
    notes: row.notes,
    amount: number(row.amount),
    currency: row.currency,
    date: date(row.date),
    categoryId: row.categoryId,
    categoryName: row.category_name,
  };
}

function mapCategory(row: CategoryRow): CategoryReadModel {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    colour: row.colour,
    parentId: row.parentId,
  };
}

function mapRule(row: RuleRow): RuleReadModel {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    resultCategoryId: row.result_category_id,
    order: row.order,
    isActive: row.is_active,
    conditionLogic: row.condition_logic,
    conditions: row.conditions ?? [],
  };
}

function mapSavingGoal(row: SavingGoalRow): SavingGoalReadModel {
  const accounts = Array.isArray(row.accounts)
    ? row.accounts
    : String(row.accounts ?? '')
        .split(',')
        .filter(Boolean);
  const targetAmount = number(row.target_amount);
  const currentAmount = number(row.current_amount);
  const targetDate = row.target_date ? date(row.target_date) : null;
  const progressPercentage =
    targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isCompleted = progressPercentage >= 100;
  const daysRemaining = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000)
    : null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    targetAmount,
    targetDate,
    accounts,
    currentAmount,
    progressPercentage,
    isCompleted,
    isOverdue: daysRemaining !== null && daysRemaining < 0 && !isCompleted,
    remainingAmount: Math.max(0, targetAmount - currentAmount),
    daysRemaining,
  };
}

function mapRegularPayment(row: RegularPaymentRow): RegularPaymentReadModel {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    name: row.name,
    amount: number(row.amount),
    currency: row.currency,
    cadence: row.cadence,
    startDate: row.startDate ? date(row.startDate) : null,
    imageUrl: row.imageUrl,
    categoryId: row.categoryId,
  };
}

function mapNotification(row: NotificationRow): NotificationReadModel {
  return {
    id: row.id,
    message: row.message,
    icon: row.icon,
    type: row.type,
    action: row.action,
    isRead: row.is_read,
    createdAt: date(row.created_at),
  };
}
