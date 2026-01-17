import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { NordigenKeyAccount } from './nordigen-key-account.entity';

@Entity('nordigen_keys')
export class NordigenKey extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column()
  secret_id: string;

  @Column()
  secret_key: string;

  @Column({ nullable: true })
  last_sync_at: Date | null;

  @Column({ nullable: true })
  last_error_at: Date | null;

  @Column({ nullable: true })
  last_error_message: string | null;

  @OneToMany(() => NordigenKeyAccount, (keyAccount) => keyAccount.nordigenKey)
  linkedAccounts: NordigenKeyAccount[];
}
