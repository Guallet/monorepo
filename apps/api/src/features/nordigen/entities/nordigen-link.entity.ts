import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';
@Entity('nordigen_links')
@Index('nordigen_links_owner_remote_unique', ['user_id', 'remote_account_id'], {
  unique: true,
})
export class NordigenLink extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'nordigen_links_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;
  @Column({ type: 'text' })
  remote_account_id: string;
  @Column({ type: 'uuid' })
  @ForeignKey(() => Account, 'id', {
    name: 'nordigen_links_account',
    onDelete: 'CASCADE',
  })
  guallet_account_id: string;
  @Column({ type: 'boolean', default: true })
  is_linked: boolean;
}
