import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Budget } from 'src/features/budgets/entities/budget.entity';

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
  parent: Category;

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
