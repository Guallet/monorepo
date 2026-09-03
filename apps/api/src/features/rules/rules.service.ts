import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CategorizationRule as CategorizationRuleEntity,
  RuleCondition,
} from './entities/categorization-rule.entity.js';
import { CreateRuleDto } from './dto/create-rule.dto.js';
import { UpdateRuleDto } from './dto/update-rule.dto.js';
import {
  CategorizationRule,
  ConditionLogicType,
  evaluateRules,
  isValidOperatorForField,
  TransactionFieldType,
  RuleEvaluationResult,
  OperatorType,
  TransactionField,
} from './engine/index.js';

import { Transaction } from '../transactions/entities/transaction.entity.js';
import {
  MAX_CONDITIONS_PER_RULE,
  MAX_RULES_PER_USER,
  TOO_MANY_CONDITIONS_MESSAGE,
  TOO_MANY_RULES_MESSAGE,
} from './constants.js';
import { RuleFieldDefinitionsDto } from './dto/rule-field-definitions.dto.js';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @InjectRepository(CategorizationRuleEntity)
    private readonly rulesRepository: Repository<CategorizationRuleEntity>,

    @InjectRepository(RuleCondition)
    private readonly conditionsRepository: Repository<RuleCondition>,

    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  /**
   * Validate that all conditions have valid field-operator combinations
   */
  private validateConditions(conditions: CreateRuleDto['conditions']): void {
    // Validate input bounds to prevent DoS attacks
    if (
      !Array.isArray(conditions) ||
      conditions.length > MAX_CONDITIONS_PER_RULE
    ) {
      throw new BadRequestException(TOO_MANY_CONDITIONS_MESSAGE);
    }

    for (const condition of conditions) {
      // Check if field is valid
      if (
        !Object.values(TransactionField).includes(
          condition.field as TransactionFieldType,
        )
      ) {
        throw new BadRequestException(
          `Invalid field "${condition.field}". Valid fields are: ${Object.values(TransactionField).join(', ')}`,
        );
      }

      // Check if operator is valid for the field
      if (
        !isValidOperatorForField(
          condition.field as TransactionFieldType,
          condition.operator,
        )
      ) {
        throw new BadRequestException(
          `Invalid operator "${condition.operator}" for field "${condition.field}"`,
        );
      }
    }
  }

  /**
   * Returns the configured limits and messages for rules
   */
  getLimits(): {
    maxConditionsPerRule: number;
    maxRulesPerUser: number;
    tooManyConditionsMessage: string;
    tooManyRulesMessage: string;
  } {
    return {
      maxConditionsPerRule: MAX_CONDITIONS_PER_RULE,
      maxRulesPerUser: MAX_RULES_PER_USER,
      tooManyConditionsMessage: TOO_MANY_CONDITIONS_MESSAGE,
      tooManyRulesMessage: TOO_MANY_RULES_MESSAGE,
    };
  }

  /**
   * Create a new categorization rule
   */
  async create({
    userId,
    dto,
  }: {
    userId: string;
    dto: CreateRuleDto;
  }): Promise<CategorizationRuleEntity> {
    this.logger.debug(`Creating a new rule for user ${userId}`, dto);

    // Validate conditions
    this.validateConditions(dto.conditions);

    // Enforce per-user rule count limit to prevent abuse
    const existingRuleCount = await this.rulesRepository.count({
      where: { userId },
    });
    if (existingRuleCount >= MAX_RULES_PER_USER) {
      throw new BadRequestException(TOO_MANY_RULES_MESSAGE);
    }

    // Get the next order number
    const maxOrderResult = await this.rulesRepository
      .createQueryBuilder('rule')
      .select('MAX(rule.order)', 'maxOrder')
      .where('rule.userId = :userId', { userId })
      .getRawOne();

    const nextOrder = dto.order ?? (maxOrderResult?.maxOrder ?? -1) + 1;

    // Create rule entity
    const rule = this.rulesRepository.create({
      userId,
      name: dto.name,
      description: dto.description,
      resultCategoryId: dto.resultCategoryId,
      order: nextOrder,
      isActive: dto.isActive ?? true,
      conditionLogic: dto.conditionLogic ?? 'and',
    });

    const savedRule = await this.rulesRepository.save(rule);
    // Create conditions for rule
    const conditions = dto.conditions.map((c, index) =>
      this.conditionsRepository.create({
        ruleId: savedRule.id,
        field: c.field,
        operator: c.operator,
        value: c.value,
        order: c.order ?? index,
      }),
    );
    const savedConditions = await this.conditionsRepository.save(conditions);

    return {
      ...savedRule,
      conditions: savedConditions,
    } as CategorizationRuleEntity;
  }

  /**
   * Get all rules for a user
   */
  async findAll(userId: string): Promise<CategorizationRuleEntity[]> {
    return await this.rulesRepository.find({
      where: { userId },
      relations: { conditions: true },
      order: { order: 'ASC' },
    });
  }

  /**
   * Get a single rule by ID
   */
  async findOne({
    userId,
    id,
  }: {
    userId: string;
    id: string;
  }): Promise<CategorizationRuleEntity> {
    const rule = await this.rulesRepository.findOne({
      where: { id, userId },
      relations: { conditions: true },
    });

    if (!rule) {
      throw new NotFoundException(`Rule with ID "${id}" not found`);
    }

    return rule;
  }

  /**
   * Update an existing rule
   */
  async update(
    userId: string,
    id: string,
    dto: UpdateRuleDto,
  ): Promise<CategorizationRuleEntity> {
    this.logger.debug(`Updating rule ${id} for user ${userId}`, dto);

    const existingRule = await this.findOne({ userId, id });

    // Validate conditions if provided
    if (dto.conditions) {
      this.validateConditions(dto.conditions);
    }

    // Update rule properties
    if (dto.name !== undefined) existingRule.name = dto.name;
    if (dto.description !== undefined)
      existingRule.description = dto.description;
    if (dto.resultCategoryId !== undefined)
      existingRule.resultCategoryId = dto.resultCategoryId;
    if (dto.order !== undefined) existingRule.order = dto.order;
    if (dto.isActive !== undefined) existingRule.isActive = dto.isActive;
    if (dto.conditionLogic !== undefined)
      existingRule.conditionLogic = dto.conditionLogic;

    // Update conditions if provided
    if (dto.conditions) {
      // Delete existing conditions
      await this.conditionsRepository.delete({ ruleId: id });

      // Create new conditions
      const conditions = dto.conditions.map((c, index) =>
        this.conditionsRepository.create({
          ruleId: id,
          field: c.field,
          operator: c.operator,
          value: c.value,
          order: c.order ?? index,
        }),
      );

      existingRule.conditions =
        await this.conditionsRepository.save(conditions);
    }

    return this.rulesRepository.save(existingRule);
  }

  /**
   * Delete a rule
   */
  async remove(userId: string, id: string): Promise<CategorizationRuleEntity> {
    const rule = await this.findOne({ userId, id });
    if (!rule) {
      throw new NotFoundException(`Rule with ID "${id}" not found`);
    }
    await this.rulesRepository.remove(rule);
    return rule;
  }

  /**
   * Reorder rules
   */
  async reorderRules(
    userId: string,
    ruleIds: string[],
  ): Promise<CategorizationRuleEntity[]> {
    // Validate input bounds to prevent DoS attacks
    if (!Array.isArray(ruleIds) || ruleIds.length > MAX_RULES_PER_USER) {
      throw new BadRequestException(TOO_MANY_RULES_MESSAGE);
    }

    this.logger.debug(`Reordering rules for user ${userId}`, ruleIds);

    // Verify all rules belong to user
    const rules = await this.rulesRepository.find({
      where: { id: In(ruleIds), userId },
    });

    if (rules.length !== ruleIds.length) {
      throw new BadRequestException(
        'Some rule IDs are invalid or do not belong to you',
      );
    }

    // Update orders
    for (let i = 0; i < ruleIds.length; i++) {
      await this.rulesRepository.update(
        { id: ruleIds[i], userId },
        { order: i },
      );
    }

    return this.findAll(userId);
  }

  /**
   * Reorder conditions within a rule
   */
  async reorderConditions(
    userId: string,
    ruleId: string,
    conditionIds: string[],
  ): Promise<CategorizationRuleEntity> {
    // Validate input bounds to prevent DoS attacks
    if (
      !Array.isArray(conditionIds) ||
      conditionIds.length > MAX_CONDITIONS_PER_RULE
    ) {
      throw new BadRequestException(TOO_MANY_CONDITIONS_MESSAGE);
    }

    // Verify rule belongs to user
    await this.findOne({ userId, id: ruleId });

    // Verify all conditions belong to the rule
    const conditions = await this.conditionsRepository.find({
      where: { id: In(conditionIds), ruleId },
    });

    if (conditions.length !== conditionIds.length) {
      throw new BadRequestException(
        'Some condition IDs are invalid or do not belong to this rule',
      );
    }

    // Update orders
    for (let i = 0; i < conditionIds.length; i++) {
      await this.conditionsRepository.update(
        { id: conditionIds[i], ruleId },
        { order: i },
      );
    }

    return this.findOne({ userId, id: ruleId });
  }

  /**
   * Evaluate a transaction against all user rules
   */
  async evaluateTransaction({
    userId,
    transaction,
  }: {
    userId: string;
    transaction: Transaction;
  }): Promise<RuleEvaluationResult> {
    const rules = await this.findAll(userId);

    const domainRules: CategorizationRule[] = rules.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      description: r.description,
      conditions: r.conditions.map((c) => ({
        id: c.id,
        field: c.field as TransactionFieldType,
        operator: c.operator as OperatorType,
        value: c.value,
        order: c.order,
      })),
      conditionLogic: (r.conditionLogic ?? 'and') as ConditionLogicType,
      resultCategoryId: r.resultCategoryId,
      order: r.order,
      isActive: r.isActive,
    }));

    return evaluateRules(transaction, domainRules);
  }

  /**
   * Get field definitions with valid operators
   */
  getFieldDefinitions(): RuleFieldDefinitionsDto {
    return {
      fields: [
        {
          name: TransactionField.ACCOUNT,
          label: 'Account',
          type: 'account',
          operators: [
            { value: 'is', label: 'Is' },
            { value: 'is_not', label: 'Is not' },
            { value: 'is_in_list', label: 'Is in list' },
            { value: 'is_not_in_list', label: 'Is not in list' },
          ],
        },
        {
          name: TransactionField.DESCRIPTION,
          label: 'Description',
          type: 'string',
          operators: [
            { value: 'equals', label: 'Equals' },
            { value: 'not_equals', label: 'Does not equal' },
            { value: 'contains', label: 'Contains' },
            { value: 'matches', label: 'Matches regex' },
          ],
        },
        {
          name: TransactionField.AMOUNT,
          label: 'Amount',
          type: 'number',
          operators: [
            { value: 'equals', label: 'Equals' },
            { value: 'not_equals', label: 'Does not equal' },
            { value: 'greater_than', label: 'Greater than' },
            { value: 'less_than', label: 'Less than' },
            {
              value: 'greater_than_or_equals',
              label: 'Greater than or equals',
            },
            { value: 'less_than_or_equals', label: 'Less than or equals' },
          ],
        },
        {
          name: TransactionField.DATE,
          label: 'Date',
          type: 'datetime',
          operators: [
            { value: 'equals', label: 'Equals' },
            { value: 'not_equals', label: 'Does not equal' },
            { value: 'before', label: 'Before' },
            { value: 'after', label: 'After' },
            { value: 'between', label: 'Between' },
          ],
        },
      ],
    };
  }
}
