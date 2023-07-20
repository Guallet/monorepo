import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  nordigen_id: string;

  @Column()
  name: string;

  @Column()
  image_src: string;

  @Column('simple-array', { nullable: true })
  countries: string[];

  // Relations
  @OneToMany(() => Account, (account) => account.institution, {
    onDelete: 'SET NULL',
  })
  accounts: Account[];

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
