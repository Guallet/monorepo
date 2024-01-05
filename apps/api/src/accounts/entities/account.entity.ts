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
  OneToMany,
} from 'typeorm';
import { Institution } from 'src/institutions/entities/institution.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Entity('accounts')
@ObjectType()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column()
  @Field((type) => ID)
  user_id: string;

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
  @OneToMany(() => Transaction, (transaction) => transaction.account, {
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];

  @ManyToOne(() => Institution, (institution) => institution.accounts)
  @Field((type) => Institution, { nullable: true })
  institution: Institution;

  @Column({ nullable: true })
  institutionId: string;

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
