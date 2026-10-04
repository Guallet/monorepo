import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Institution } from '../institutions/entities/institution.entity';
import { Budget } from '../budgets/entities/budget.entity';
import {
  CategorizationRule,
  RuleCondition,
} from '../rules/entities/categorization-rule.entity';

// Run only in an isolated temporary PostgreSQL cluster:
// CATEGORY_DATABASE_TEST=1 pg_virtualenv pnpm exec vitest run src/features/categories/categories.database.spec.ts --maxWorkers=1
const databaseEnabled =
  process.env.CATEGORY_DATABASE_TEST === '1' && Boolean(process.env.PGPORT);

describe.skipIf(!databaseEnabled)(
  'CategoriesService PostgreSQL behavior',
  () => {
    let database: DataSource;
    let service: CategoriesService;
    const user = 'category-test-user';
    const request = { name: 'Food', icon: 'IconTag', colour: '#005EB8' };

    beforeAll(async () => {
      database = new DataSource({
        type: 'postgres',
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT),
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        entities: [
          Category,
          Account,
          Transaction,
          Institution,
          Budget,
          CategorizationRule,
          RuleCondition,
        ],
        synchronize: true,
      });
      await database.initialize();
      service = new CategoriesService(database.getRepository(Category));
    });
    afterAll(async () => {
      if (database?.isInitialized) await database.destroy();
    });

    it('keeps transactions and clears their category when deleting a leaf', async () => {
      const category = await service.create({ user_id: user, dto: request });
      const account = await database
        .getRepository(Account)
        .save({ user_id: user, name: 'Account', balance: 0, currency: 'GBP' });
      const transaction = await database.getRepository(Transaction).save({
        description: 'Groceries',
        amount: -10,
        currency: 'GBP',
        date: new Date(),
        accountId: account.id,
        categoryId: category.id,
      });
      const deleted = await service.removeUserCategory({
        user_id: user,
        category_id: category.id,
      });
      expect(deleted.id).toBe(category.id);
      expect(
        await database
          .getRepository(Transaction)
          .findOneBy({ id: transaction.id }),
      ).toMatchObject({ categoryId: null, description: 'Groceries' });
    });

    it('blocks deletion for children created with either parent mapping', async () => {
      const parent = await service.create({ user_id: user, dto: request });
      const child = await service.create({
        user_id: user,
        dto: { ...request, name: 'Child', parentId: parent.id },
      });
      await expect(
        service.removeUserCategory({ user_id: user, category_id: parent.id }),
      ).rejects.toThrow('Move or delete the subcategories');
      await service.removeUserCategory({
        user_id: user,
        category_id: child.id,
      });
      await database
        .getRepository(Category)
        .save({ ...request, user_id: user, parentId: parent.id });
      await expect(
        service.removeUserCategory({ user_id: user, category_id: parent.id }),
      ).rejects.toThrow('Move or delete the subcategories');
      expect(
        await database.getRepository(Category).findOneBy({ id: parent.id }),
      ).not.toBeNull();
    });

    it('clears both parent mappings when a subcategory becomes a root', async () => {
      const parent = await service.create({ user_id: user, dto: request });
      const child = await service.create({
        user_id: user,
        dto: { ...request, parentId: parent.id },
      });
      await service.update({
        user_id: user,
        category_id: child.id,
        dto: { parentId: null },
      });
      const saved = await database.getRepository(Category).findOne({
        where: { id: child.id, user_id: user },
        relations: { parent: true },
      });
      expect(saved).toMatchObject({ parentId: null, parent: null });
      await service.removeUserCategory({
        user_id: user,
        category_id: parent.id,
      });
      expect(
        await database.getRepository(Category).findOneBy({ id: child.id }),
      ).not.toBeNull();
    });

    it('prevents budget association loss until the category is removed from the budget', async () => {
      const category = await service.create({ user_id: user, dto: request });
      const budget = await database.getRepository(Budget).save({
        user_id: user,
        name: 'Budget',
        amount: 100,
        currency: 'GBP',
        categories: [category],
      });
      await expect(
        service.removeUserCategory({ user_id: user, category_id: category.id }),
      ).rejects.toThrow('Remove this category from its budgets');
      budget.categories = [];
      await database.getRepository(Budget).save(budget);
      await service.removeUserCategory({
        user_id: user,
        category_id: category.id,
      });
      expect(
        await database.getRepository(Budget).findOneBy({ id: budget.id }),
      ).not.toBeNull();
    });

    it('blocks dangling category references in disabled rules too', async () => {
      const category = await service.create({ user_id: user, dto: request });
      await database.getRepository(CategorizationRule).save({
        userId: user,
        name: 'Rule',
        resultCategoryId: category.id,
        order: 0,
        isActive: false,
      });
      await expect(
        service.removeUserCategory({ user_id: user, category_id: category.id }),
      ).rejects.toThrow('Update or delete the rules');
    });

    it('prevents a concurrent create/delete from producing orphaned subcategories', async () => {
      const parent = await service.create({ user_id: user, dto: request });
      const outcomes = await Promise.allSettled([
        service.create({
          user_id: user,
          dto: { ...request, parentId: parent.id },
        }),
        service.removeUserCategory({ user_id: user, category_id: parent.id }),
      ]);
      expect(
        outcomes.filter((outcome) => outcome.status === 'rejected'),
      ).toHaveLength(1);
      const parentExists = await database
        .getRepository(Category)
        .exists({ where: { id: parent.id } });
      const children = await database
        .getRepository(Category)
        .findBy({ parentId: parent.id });
      if (!parentExists) expect(children).toHaveLength(0);
      if (children.length) expect(parentExists).toBe(true);
    });
  },
);
