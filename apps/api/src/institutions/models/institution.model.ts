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

  @Column({ nullable: true })
  @Field({ nullable: true })
  user_id?: string;

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
