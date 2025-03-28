import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ type: 'text', nullable: true })
  colour: string;

  @Column({ type: 'text', nullable: true })
  icon: string;

  @Column('simple-array')
  categories: string[];
}
