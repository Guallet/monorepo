import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Category } from 'src/features/categories/entities/category.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

export enum RecurringPaymentType {
  SUBSCRIPTION = 'subscription',
  REGULAR_PAYMENT = 'regular_payment',
  REGULAR_INCOME = 'regular_income',
}

export enum RecurrenceCadence {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Entity('regular-payments')
export class RegularPayment extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: RecurringPaymentType,
  })
  type: RecurringPaymentType;

  @Column()
  name: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: RecurrenceCadence,
  })
  cadence: RecurrenceCadence;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  imageUrl?: string;

  // Category relation
  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  category?: Relation<Category>;

  @Column({ nullable: true })
  categoryId?: string;
}
