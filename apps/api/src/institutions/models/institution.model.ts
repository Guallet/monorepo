import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Account } from 'src/accounts/models/account.model';
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
@ObjectType()
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  image_src?: string;

  // If this is not null, it's because the user created this manually. We need a UI to manage this from the user app
  @Column({ nullable: true })
  @Field({ nullable: true })
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
