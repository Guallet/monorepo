import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('rules')
export class Rule extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_rules_id' })
  id: string;

  @Column()
  user_id: string;

  @Column()
  order: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RuleCondition, (condition) => condition.rule, {
    onDelete: 'CASCADE',
  })
  conditions: RuleCondition[];

  @Column()
  resultCategoryId: string;
}

@Entity('rule_conditions')
export class RuleCondition extends BaseDbEntity {
  // export type RuleConditions = {
  //     field: TransactionField;
  //     operator: RuleConditionsOperator;
  //     value: string;
  //   };

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_rule_conditions_id',
  })
  id: string;

  @Column()
  ruleId: string;

  @Column()
  field: string;

  @Column()
  operator: string;

  @Column()
  value: string;

  // Relations
  @ManyToOne(() => Rule, (x) => x.conditions)
  rule: Rule;
}

export type TransactionField =
  | 'description'
  | 'account'
  | 'amount'
  | 'currency'
  | 'date';

export type RuleConditionsOperator =
  | 'equals'
  | 'not-equals'
  | 'contains'
  | 'not-contains';
//   | "greater-than"
//   | "less-than"
//   | "greater-than-equals"
//   | "less-than-equals"
//   | "between"
//   | "not-between"
//   | "in"
//   | "not-in"
//   | "is-null"
//   | "is-not-null"
//   | "starts-with"
//   | "ends-with"
//   | "is-empty"
//   | "is-not-empty"
//   | "is-undefined"
//   | "is-not-undefined";
