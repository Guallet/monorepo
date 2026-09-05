import { BaseDbEntity } from '../../../database/BaseDbEntity.js';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Category } from '../../../features/categories/entities/category.entity.js';
import type { Relation } from 'typeorm';

@Entity('budgets')
export class Budget extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ nullable: false })
  currency: string;

  @Column({ type: 'text', nullable: true })
  colour: string;

  @Column({ type: 'text', nullable: true })
  icon: string;

  @ManyToMany(() => Category, (category) => category.budgets, { cascade: true })
  @JoinTable({
    name: 'budget_categories',
    joinColumn: { name: 'budget_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Relation<Category[]>;
}
