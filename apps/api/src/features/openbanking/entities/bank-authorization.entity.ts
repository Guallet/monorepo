import { Column, Entity, ForeignKey, PrimaryGeneratedColumn } from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { User } from '../../users/entities/user.entity';
import { BankConnection } from './bank-connection.entity';

@Entity('bank_authorizations')
export class BankAuthorization extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'bank_authorizations_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => BankConnection, 'id', {
    name: 'bank_authorizations_connection',
    onDelete: 'CASCADE',
  })
  connection_id: string;

  @Column({ type: 'text' })
  remote_id: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  account_ids: string[];

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'timestamp' })
  expires_at: Date;
}
