import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { NordigenKey } from './nordigen-key.entity';

@Entity('nordigen_key_accounts')
export class NordigenKeyAccount extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nordigen_key_id: string;

  @Column()
  account_id: string;

  @ManyToOne(() => NordigenKey, (key) => key.linkedAccounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'nordigen_key_id' })
  nordigenKey: NordigenKey;
}
