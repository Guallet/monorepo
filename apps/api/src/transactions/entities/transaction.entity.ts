import { Account } from 'src/accounts/entities/account.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BaseDbEntity } from 'src/core/baseDbEntity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column()
  currency: string;

  @Column()
  date: Date;

  // relations
  @ManyToOne(() => Account, (account) => account.transactions)
  account: Account;

  @Column({ nullable: true })
  accountId: string;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
  })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;
}
