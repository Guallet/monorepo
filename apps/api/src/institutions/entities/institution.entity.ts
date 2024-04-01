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

  @Column()
  name: string;

  @Column({ nullable: true })
  image_src?: string;

  // If this is not null, it's because the user created this manually. We need a UI to manage this from the user app
  @Column({ nullable: true })
  user_id?: string;

  // THIS IS BECAUSE NORDIGEN OPEN BANKING
  @Column({ nullable: true, unique: true })
  nordigen_id: string;

  @Column('simple-array', { nullable: true })
  countries: string[];

  // relations
  @OneToMany(() => Account, (account) => account.institution)
  accounts: Account[];

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
