import { BaseDbEntity } from '../../../database/BaseDbEntity.js';
import { Transaction } from '../../../features/transactions/entities/transaction.entity.js';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Budget } from '../../../features/budgets/entities/budget.entity.js';
import type { Relation } from 'typeorm';

@Entity('categories')
export class Category extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_categories' })
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  colour?: string;

  @Column({ nullable: true })
  parentId?: string;

  // Relations
  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'CASCADE',
  })
  parent: Relation<Category>;

  @OneToMany(() => Category, (category) => category.parent, {
    onDelete: 'SET NULL',
  })
  children: Category[];

  @OneToMany(() => Transaction, (transaction) => transaction.category, {
    onDelete: 'SET NULL',
  })
  transactions: Transaction[];

  @ManyToMany(() => Budget, (budget) => budget.categories)
  budgets: Budget[];
}
