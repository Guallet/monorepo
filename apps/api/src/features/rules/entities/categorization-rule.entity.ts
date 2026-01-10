import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('categorization_rules')
export class CategorizationRuleEntity extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_categorization_rules_id',
  })
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ name: 'result_category_id' })
  resultCategoryId: string;

  @Column({ name: 'order', type: 'int' })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => RuleConditionEntity, (condition) => condition.rule, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  conditions: Relation<RuleConditionEntity[]>;
}

@Entity('rule_conditions')
export class RuleConditionEntity extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_rule_conditions_id',
  })
  id: string;

  @Column({ name: 'rule_id' })
  ruleId: string;

  @Column()
  field: string;

  @Column()
  operator: string;

  @Column()
  value: string;

  @Column({ name: 'order', type: 'int' })
  order: number;

  @ManyToOne(() => CategorizationRuleEntity, (rule) => rule.conditions, {
    onDelete: 'CASCADE',
  })
  rule: Relation<CategorizationRuleEntity>;
}
