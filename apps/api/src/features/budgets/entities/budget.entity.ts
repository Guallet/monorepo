import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('budgets')
export class Budget {
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

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
