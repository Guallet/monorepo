import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('saving_goals')
export class SavingGoal extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  target_amount: number;

  @Column({ nullable: true })
  target_date?: Date;

  @Column({ nullable: true })
  priority?: number;

  // Should be this a proper ManyToMany relation?
  // Keep it as simple array for now
  // Accounts used as source for the saving goal
  @Column('simple-array')
  accounts: string[];

  // Relations
  //   @ManyToOne(() => User, (user) => user.saving_goals, { onDelete: 'CASCADE' })
  //   user: Relation<User>;

  @Column()
  userId: string;
}
