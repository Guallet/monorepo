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
export class CategorizationRule extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ name: 'result_category_id' })
  resultCategoryId: string;

  @Column({ name: 'order', type: 'int' })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'condition_logic', default: 'and' })
  conditionLogic: string;

  @OneToMany(() => RuleCondition, (condition) => condition.rule, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  conditions: Relation<RuleCondition[]>;
}

@Entity('rule_conditions')
export class RuleCondition extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  field: string;

  @Column()
  operator: string;

  @Column()
  value: string;

  @Column({ name: 'order', type: 'int' })
  order: number;

  // Relations
  @ManyToOne(() => CategorizationRule, (rule) => rule.conditions, {
    onDelete: 'CASCADE',
  })
  rule: Relation<CategorizationRule>;

  @Column()
  ruleId: string;
}
