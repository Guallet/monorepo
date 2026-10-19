import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/features/users/entities/user.entity';
import { Account } from 'src/features/accounts/entities/account.entity';

@Entity('lunchflow_accounts')
@Index(
  'lunchflow_accounts_user_remote_unique',
  ['user_id', 'remote_account_id'],
  {
    unique: true,
  },
)
export class LunchFlowAccount extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'lunchflow_accounts_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text' })
  remote_account_id: string;

  @Column({ type: 'text', nullable: true })
  remote_connection_id: string | null;

  @Column({ type: 'uuid' })
  @ForeignKey(() => Account, 'id', {
    name: 'lunchflow_accounts_guallet_account',
    onDelete: 'CASCADE',
  })
  guallet_account_id: string;
}
