import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('waitinglist')
export class WaitingList extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;
}
