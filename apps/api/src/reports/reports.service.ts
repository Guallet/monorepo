import { Injectable, Logger } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/models/category.entity';
import { Account } from 'src/accounts/models/account.model';
import { Transaction } from 'src/transactions/models/transaction.entity';
import {
  CashflowDataDto,
  CategoryDataRowDto,
  SubCategoryDataRow,
} from './cashflow/cashflowData.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async getCashFlowReport(args: {
    user_id: string;
    year: number;
  }): Promise<CashflowDataDto> {
    const { user_id, year } = args;

    const categories = await this.categoriesRepository.find({
      where: {
        user_id: user_id,
      },
    });

    const transactions = await this.transactionsRepository.find({
      relations: ['category', 'account'],
      where: {
        account: {
          user_id: user_id,
        },
        date: Between(new Date(year, 0, 1), new Date(year, 11, 31)),
      },
      order: {
        date: 'ASC',
      },
    });

    const dto = new CashflowDataDto();
    dto.year = year;
    dto.totalTransactions = transactions.length;
    dto.data = categories
      .filter((c) => c.parentId === null)
      .map((category) => {
        const row = new CategoryDataRowDto();
        row.categoryId = category.id;
        row.categoryName = category.name;
        row.isParent = category.parentId === null;

        const categoryTransactions = transactions.filter((t) => {
          return t.categoryId === category.id;
        });

        const subcategoriesTransactions = transactions.filter((t) => {
          return (
            t.category !== null &&
            t.category.parentId !== null &&
            t.category.parentId === category.id
          );
        });

        const allTransactions = [
          ...categoryTransactions,
          ...subcategoriesTransactions,
        ];

        row.totalTransactions = allTransactions.length;

        const newData = [
          getTotalMonthly(allTransactions, 0),
          getTotalMonthly(allTransactions, 1),
          getTotalMonthly(allTransactions, 2),
          getTotalMonthly(allTransactions, 3),
          getTotalMonthly(allTransactions, 4),
          getTotalMonthly(allTransactions, 5),
          getTotalMonthly(allTransactions, 6),
          getTotalMonthly(allTransactions, 7),
          getTotalMonthly(allTransactions, 8),
          getTotalMonthly(allTransactions, 9),
          getTotalMonthly(allTransactions, 10),
          getTotalMonthly(allTransactions, 11),
        ];

        row.values = newData;

        row.subcategories = getSubCategoryRows(
          category.id,
          categories,
          transactions,
        );

        return row;
      });
    return dto;
  }
}

function getTotalMonthly(
  transactions: Transaction[],
  monthNumber: number,
): string {
  const validTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    const month = date.getMonth();
    return month === monthNumber;
  });

  const total = validTransactions.reduce((sum, t) => {
    return sum + Number(t.amount);
  }, 0);

  return total.toFixed(2);
}

function getSubCategoryRows(
  parentId: string,
  categories: Category[],
  transactions: Transaction[],
): SubCategoryDataRow[] {
  const subcategories = categories.filter((c) => {
    return c.parentId === parentId;
  });

  const rows = subcategories.map((subcategory) => {
    const row = new SubCategoryDataRow();

    const validTransactions = transactions.filter((t) => {
      return t.categoryId === subcategory.id;
    });

    row.categoryId = subcategory.id;
    row.categoryName = subcategory.name;
    row.totalTransactions = validTransactions.length;
    row.values = [
      getTotalMonthly(validTransactions, 0),
      getTotalMonthly(validTransactions, 1),
      getTotalMonthly(validTransactions, 2),
      getTotalMonthly(validTransactions, 3),
      getTotalMonthly(validTransactions, 4),
      getTotalMonthly(validTransactions, 5),
      getTotalMonthly(validTransactions, 6),
      getTotalMonthly(validTransactions, 7),
      getTotalMonthly(validTransactions, 8),
      getTotalMonthly(validTransactions, 9),
      getTotalMonthly(validTransactions, 10),
      getTotalMonthly(validTransactions, 11),
    ];
    return row;
  });

  return rows;
}
