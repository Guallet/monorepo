import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { FinanceReadService } from '@guallet/finance-core';
import { z } from 'zod';
import type { ReadScope, TokenPrincipal } from './oauth-store.js';

const pageSchema = {
  page: z
    .number()
    .int()
    .min(1)
    .max(10_000)
    .optional()
    .describe('1-based page number'),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Maximum 100 results per page'),
};

const idSchema = z.string().uuid().describe('Guallet record ID');

export function registerTools(
  server: McpServer,
  service: FinanceReadService,
  principal: TokenPrincipal,
): void {
  register(
    server,
    principal,
    'accounts:read',
    'list_accounts',
    'List the authenticated user’s financial accounts and balances.',
    pageSchema,
    async (input) => {
      return { accounts: await service.listAccounts(principal.userId, input) };
    },
  );
  register(
    server,
    principal,
    'accounts:read',
    'get_account',
    'Inspect one financial account owned by the authenticated user.',
    { accountId: idSchema },
    async ({ accountId }) => {
      return {
        account: await required(
          service.getAccount(principal.userId, accountId),
          'Account',
        ),
      };
    },
  );

  register(
    server,
    principal,
    'transactions:read',
    'list_transactions',
    'List transactions with optional account, category, and date filters.',
    {
      ...pageSchema,
      accountIds: z.array(idSchema).max(50).optional(),
      categoryIds: z.array(idSchema).max(50).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    },
    async (input) => {
      const startDate = input.startDate ? new Date(input.startDate) : undefined;
      const endDate = input.endDate ? new Date(input.endDate) : undefined;
      if (startDate && endDate && endDate <= startDate)
        throw invalid('endDate must be after startDate');
      if (
        startDate &&
        endDate &&
        endDate.getTime() - startDate.getTime() > 366 * 86_400_000
      ) {
        throw invalid('Date ranges cannot exceed one year');
      }
      return {
        transactions: await service.listTransactions(principal.userId, {
          ...input,
          startDate,
          endDate,
        }),
      };
    },
  );
  register(
    server,
    principal,
    'transactions:read',
    'get_transaction',
    'Inspect one transaction owned by the authenticated user.',
    { transactionId: idSchema },
    async ({ transactionId }) => {
      return {
        transaction: await required(
          service.getTransaction(principal.userId, transactionId),
          'Transaction',
        ),
      };
    },
  );

  register(
    server,
    principal,
    'categories:read',
    'list_categories',
    'List the authenticated user’s transaction categories.',
    pageSchema,
    async (input) => ({
      categories: await service.listCategories(principal.userId, input),
    }),
  );
  register(
    server,
    principal,
    'rules:read',
    'list_categorization_rules',
    'List the authenticated user’s categorization rules and conditions.',
    pageSchema,
    async (input) => ({
      rules: await service.listRules(principal.userId, input),
    }),
  );

  const budgetInput = {
    ...pageSchema,
    month: z.number().int().min(0).max(11).optional(),
    year: z.number().int().min(2000).max(2200).optional(),
  };
  register(
    server,
    principal,
    'budgets:read',
    'list_budgets',
    'List budgets with progress for a selected month.',
    budgetInput,
    async (input) => {
      const now = new Date();
      return {
        budgets: await service.listBudgets(principal.userId, {
          ...input,
          month: input.month ?? now.getUTCMonth(),
          year: input.year ?? now.getUTCFullYear(),
        }),
      };
    },
  );
  register(
    server,
    principal,
    'budgets:read',
    'get_budget',
    'Inspect one budget with monthly progress.',
    {
      budgetId: idSchema,
      month: z.number().int().min(0).max(11).optional(),
      year: z.number().int().min(2000).max(2200).optional(),
    },
    async (input) => {
      const now = new Date();
      return {
        budget: await required(
          service.getBudget(
            principal.userId,
            input.budgetId,
            input.month ?? now.getUTCMonth(),
            input.year ?? now.getUTCFullYear(),
          ),
          'Budget',
        ),
      };
    },
  );

  register(
    server,
    principal,
    'saving-goals:read',
    'list_saving_goals',
    'List saving goals with current amount and progress.',
    pageSchema,
    async (input) => ({
      savingGoals: await service.listSavingGoals(
        principal.userId,
        undefined,
        input,
      ),
    }),
  );
  register(
    server,
    principal,
    'saving-goals:read',
    'get_saving_goal',
    'Inspect one saving goal and its progress.',
    { goalId: idSchema },
    async ({ goalId }) => ({
      savingGoal: await required(
        service.getSavingGoal(principal.userId, goalId),
        'Saving goal',
      ),
    }),
  );
  register(
    server,
    principal,
    'recurring-payments:read',
    'list_recurring_payments',
    'List recurring payments, subscriptions, and income.',
    pageSchema,
    async (input) => ({
      recurringPayments: await service.listRegularPayments(
        principal.userId,
        undefined,
        input,
      ),
    }),
  );
  register(
    server,
    principal,
    'recurring-payments:read',
    'get_recurring_payment',
    'Inspect one recurring payment, subscription, or income item.',
    { paymentId: idSchema },
    async ({ paymentId }) => ({
      recurringPayment: await required(
        service.getRegularPayment(principal.userId, paymentId),
        'Recurring payment',
      ),
    }),
  );
  register(
    server,
    principal,
    'reports:read',
    'get_cash_flow_report',
    'Read the authenticated user’s monthly cash-flow report for a year.',
    { year: z.number().int().min(2000).max(2200).optional() },
    async ({ year }) => ({
      report: await service.cashFlow(
        principal.userId,
        year ?? new Date().getUTCFullYear(),
      ),
    }),
  );
  register(
    server,
    principal,
    'notifications:read',
    'list_notifications',
    'List notifications belonging to the authenticated user.',
    pageSchema,
    async (input) => ({
      notifications: await service.listNotifications(principal.userId, input),
    }),
  );
  register(
    server,
    principal,
    'connections:read',
    'list_connections',
    'List redacted bank connection and synchronization status.',
    pageSchema,
    async (input) => ({
      connections: await service.listConnections(principal.userId, input),
    }),
  );
  register(
    server,
    principal,
    'connections:read',
    'get_connection_status',
    'Inspect redacted status for one bank connection.',
    { connectionId: idSchema },
    async ({ connectionId }) => ({
      connection: await required(
        service.getConnection(principal.userId, connectionId),
        'Connection',
      ),
    }),
  );
}

function register<T extends Record<string, z.ZodTypeAny>>(
  server: McpServer,
  principal: TokenPrincipal,
  scope: ReadScope,
  name: string,
  description: string,
  inputSchema: T,
  handler: (input: z.infer<z.ZodObject<T>>) => Promise<Record<string, unknown>>,
): void {
  server.registerTool(
    name,
    { description, inputSchema } as never,
    (async (input: unknown) => {
      if (!principal.scopes.includes(scope)) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Missing required scope: ${scope}`,
        );
      }
      try {
        const data = await handler(input as z.infer<z.ZodObject<T>>);
        return {
          content: [{ type: 'text', text: JSON.stringify(data) }],
          structuredContent: data,
        };
      } catch (error) {
        if (error instanceof McpError) throw error;
        const message =
          error instanceof Error
            ? error.message
            : 'The requested read operation failed';
        if (message.endsWith('not found')) {
          throw new McpError(ErrorCode.InvalidParams, message);
        }
        throw new McpError(
          ErrorCode.InternalError,
          'The requested read operation could not be completed',
        );
      }
    }) as never,
  );
}

function required<T>(value: T | null, label: string): T {
  if (value === null) throw new Error(`${label} not found`);
  return value;
}

function invalid(message: string): McpError {
  return new McpError(ErrorCode.InvalidParams, message);
}
