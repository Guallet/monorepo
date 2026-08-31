import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { Budget } from '../../features/budgets/entities/budget.entity.js';
import { RegularPayment } from '../../features/regular-payments/entities/regular-payment.entity.js';
import { SavingGoal } from '../../features/saving-goals/entities/saving-goal.entity.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { AiFinancialContextService } from './ai-financial-context.service.js';

describe('AiFinancialContextService', () => {
  let service: AiFinancialContextService;

  const mockAccountRepository = { find: jest.fn() };
  const mockTransactionRepository = { find: jest.fn() };
  const mockBudgetRepository = { find: jest.fn() };
  const mockSavingGoalRepository = { find: jest.fn() };
  const mockRegularPaymentRepository = { find: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiFinancialContextService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Budget),
          useValue: mockBudgetRepository,
        },
        {
          provide: getRepositoryToken(SavingGoal),
          useValue: mockSavingGoalRepository,
        },
        {
          provide: getRepositoryToken(RegularPayment),
          useValue: mockRegularPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<AiFinancialContextService>(AiFinancialContextService);
    jest.clearAllMocks();
    mockAccountRepository.find.mockResolvedValue([]);
    mockTransactionRepository.find.mockResolvedValue([]);
    mockBudgetRepository.find.mockResolvedValue([]);
    mockSavingGoalRepository.find.mockResolvedValue([]);
    mockRegularPaymentRepository.find.mockResolvedValue([]);
  });

  it('aggregates transactions per month and category without leaking descriptions', async () => {
    mockTransactionRepository.find.mockResolvedValue([
      {
        amount: '-10.50',
        date: new Date('2026-05-04'),
        description: 'TESCO STORES 0345',
        category: { name: 'Groceries' },
      },
      {
        amount: '-4.50',
        date: new Date('2026-05-20'),
        description: 'SAINSBURYS LOCAL',
        category: { name: 'Groceries' },
      },
      {
        amount: '2000',
        date: new Date('2026-05-28'),
        description: 'ACME PAYROLL',
        category: null,
      },
    ]);

    const summary = JSON.parse(await service.buildSummary('user-123')) as {
      monthlySpendingByCategory: Record<string, Record<string, number>>;
      monthlyTotals: Record<string, { income: number; expenses: number }>;
    };

    expect(summary.monthlySpendingByCategory['2026-05']).toEqual({
      Groceries: -15,
      Untagged: 2000,
    });
    expect(summary.monthlyTotals['2026-05']).toEqual({
      income: 2000,
      expenses: -15,
    });
    expect(JSON.stringify(summary)).not.toContain('TESCO');
  });

  it('includes accounts, budgets, goals, and regular payments', async () => {
    mockAccountRepository.find.mockResolvedValue([
      { name: 'Current', type: 'current', balance: '120.55', currency: 'GBP' },
    ]);
    mockBudgetRepository.find.mockResolvedValue([
      {
        name: 'Food',
        amount: '400',
        currency: 'GBP',
        categories: [{ name: 'Groceries' }],
      },
    ]);
    mockSavingGoalRepository.find.mockResolvedValue([
      { name: 'Holiday', target_amount: 1500, target_date: null },
    ]);
    mockRegularPaymentRepository.find.mockResolvedValue([
      {
        name: 'Netflix',
        type: 'subscription',
        amount: '9.99',
        currency: 'GBP',
        cadence: 'monthly',
        category: { name: 'Entertainment' },
      },
    ]);

    const summary = JSON.parse(await service.buildSummary('user-123')) as {
      accounts: unknown[];
      budgets: unknown[];
      savingGoals: unknown[];
      regularPayments: unknown[];
    };

    expect(summary.accounts).toEqual([
      { name: 'Current', type: 'current', balance: 120.55, currency: 'GBP' },
    ]);
    expect(summary.budgets).toEqual([
      { name: 'Food', amount: 400, currency: 'GBP', categories: ['Groceries'] },
    ]);
    expect(summary.savingGoals).toEqual([
      { name: 'Holiday', targetAmount: 1500, targetDate: null },
    ]);
    expect(summary.regularPayments).toEqual([
      {
        name: 'Netflix',
        type: 'subscription',
        amount: 9.99,
        currency: 'GBP',
        cadence: 'monthly',
        category: 'Entertainment',
      },
    ]);
  });
});
