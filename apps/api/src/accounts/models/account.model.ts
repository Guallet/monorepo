import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { AccountType } from './accountType.model';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Institution } from 'src/institutions/models/institution.model';

@Entity('accounts')
@ObjectType()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  // @Column()
  // @Field()
  // user_id: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: 'decimal' })
  @Field((type) => Float)
  balance: number;

  @Column()
  // @Field()
  currency: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.UNKNOWN,
  })
  @Field((type) => AccountType)
  type: AccountType;

  // relations
  // @OneToMany(() => Transaction, (transaction) => transaction.account, {
  //   onDelete: 'CASCADE',
  // })
  // transactions: Transaction[];

  @ManyToOne(() => Institution, (institution) => institution.accounts)
  @Field((type) => Institution, { nullable: true })
  institution: Institution;

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
