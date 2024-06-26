import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('nordigen_requisitions')
export class ObConnection {
  @PrimaryColumn()
  id: string;

  @Column()
  created: Date;

  @Column({ nullable: false })
  redirect: string;

  @Column()
  status: string;

  @Column({ nullable: false })
  institution_id: string;

  @Column()
  agreement: string;

  @Column()
  reference: string;

  @Column()
  user_id: string;

  @Column('simple-array')
  accounts: string[];

  @Column({ nullable: true })
  user_language: string;

  @Column()
  link: string;

  @Column({ nullable: true })
  ssn: string;

  @Column({ nullable: true })
  account_selection: boolean;

  @Column({ nullable: true })
  redirect_immediate: boolean;

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
