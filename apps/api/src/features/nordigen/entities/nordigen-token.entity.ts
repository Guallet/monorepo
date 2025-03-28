import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// @Entity({ schema: 'nordigen' })
@Entity()
export class NordigenToken {
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
