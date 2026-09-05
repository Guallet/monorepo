import { BaseDbEntity } from '../../../database/BaseDbEntity.js';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @Entity({ schema: 'nordigen' })
@Entity()
export class NordigenToken extends BaseDbEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  access: string;

  @Column()
  refresh: string;

  @Column()
  access_expires_on: Date;

  @Column()
  refresh_expires_on: Date;
}
