import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { Budget } from '../../features/budgets/entities/budget.entity.js';
import { RegularPayment } from '../../features/regular-payments/entities/regular-payment.entity.js';
import { SavingGoal } from '../../features/saving-goals/entities/saving-goal.entity.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';

const SUMMARY_MONTHS = 24;

type MonthlyCategoryTotals = Record<string, Record<string, number>>;

@Injectable()
export class AiFinancialContextService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(SavingGoal)
    private readonly savingGoalRepository: Repository<SavingGoal>,
    @InjectRepository(RegularPayment)
    private readonly regularPaymentRepository: Repository<RegularPayment>,
  ) {}

  /**
   * Builds a compact JSON snapshot of the user's finances to inject as model
   * context. Aggregates only — individual transactions are never included.
   */
  async buildSummary(userId: string): Promise<string> {
    const since = this.startOfMonthMonthsAgo(SUMMARY_MONTHS - 1);

    const [accounts, transactions, budgets, savingGoals, regularPayments] =
      await Promise.all([
        this.accountRepository.find({ where: { user_id: userId } }),
        this.transactionRepository.find({
          relations: ['category', 'account'],
          where: {
            account: { user_id: userId },
            date: MoreThanOrEqual(since),
          },
        }),
        this.budgetRepository.find({
          relations: ['categories'],
          where: { user_id: userId },
        }),
        this.savingGoalRepository.find({ where: { userId } }),
        this.regularPaymentRepository.find({
          relations: ['category'],
          where: { user_id: userId },
        }),
      ]);

    const summary = {
      generatedAt: new Date().toISOString(),
      notes:
        'Amounts are signed: negative = money out (spending), positive = money in (income). Monthly aggregates cover the last 24 months.',
      accounts: accounts.map((account) => ({
        name: account.name,
        type: account.type,
        balance: Number(account.balance),
        currency: account.currency,
      })),
      monthlyTotals: this.buildMonthlyTotals(transactions),
      monthlySpendingByCategory: this.buildMonthlyCategoryTotals(transactions),
      budgets: budgets.map((budget) => ({
        name: budget.name,
        amount: Number(budget.amount),
        currency: budget.currency,
        categories: (budget.categories ?? []).map((category) => category.name),
      })),
      savingGoals: savingGoals.map((goal) => ({
        name: goal.name,
        targetAmount: Number(goal.target_amount),
        targetDate: goal.target_date ?? null,
      })),
      regularPayments: regularPayments.map((payment) => ({
        name: payment.name,
        type: payment.type,
        amount: Number(payment.amount),
        currency: payment.currency,
        cadence: payment.cadence,
        category: payment.category?.name ?? null,
      })),
    };

    return JSON.stringify(summary);
  }

  private buildMonthlyTotals(
    transactions: Transaction[],
  ): Record<string, { income: number; expenses: number }> {
    const totals: Record<string, { income: number; expenses: number }> = {};

    for (const transaction of transactions) {
      const month = this.monthKey(transaction.date);
      totals[month] ??= { income: 0, expenses: 0 };
      const amount = Number(transaction.amount);
      if (amount >= 0) {
        totals[month].income = this.round(totals[month].income + amount);
      } else {
        totals[month].expenses = this.round(totals[month].expenses + amount);
      }
    }

    return totals;
  }

  private buildMonthlyCategoryTotals(
    transactions: Transaction[],
  ): MonthlyCategoryTotals {
    const totals: MonthlyCategoryTotals = {};

    for (const transaction of transactions) {
      const month = this.monthKey(transaction.date);
      const category = transaction.category?.name ?? 'Untagged';
      totals[month] ??= {};
      totals[month][category] = this.round(
        (totals[month][category] ?? 0) + Number(transaction.amount),
      );
    }

    return totals;
  }

  private monthKey(date: Date): string {
    const value = new Date(date);
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    return `${value.getFullYear()}-${month}`;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private startOfMonthMonthsAgo(months: number): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - months, 1);
  }
}
