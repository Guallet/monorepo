import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RulesService } from './rules.service.js';
import { CreateRuleDto } from './dto/create-rule.dto.js';
import { UpdateRuleDto } from './dto/update-rule.dto.js';
import { RuleDto } from './dto/rule.dto.js';
import {
  ReorderRulesDto,
  ReorderConditionsDto,
} from './dto/reorder-rules.dto.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RuleEvaluationResultDto } from './dto/rule-evaluation-result.dto.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { LimitsDto } from './dto/limits.dto.js';

@ApiTags('Categorization Rules')
@Controller('rules')
export class RulesController {
  private readonly logger = new Logger(RulesController.name);

  constructor(
    private readonly rulesService: RulesService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new categorization rule' })
  @ApiBody({ type: CreateRuleDto })
  @ApiResponse({ status: 201, type: RuleDto })
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createRuleDto: CreateRuleDto,
  ): Promise<RuleDto> {
    const rule = await this.rulesService.create({
      userId: user.id,
      dto: createRuleDto,
    });

    this.logger.log(
      `Created new rule with ID ${rule.id} for user ${user.id}`,
      rule,
    );
    return RuleDto.fromEntity(rule);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categorization rules' })
  @ApiResponse({ status: 200, type: [RuleDto] })
  async findAll(@RequestUser() user: UserPrincipal): Promise<RuleDto[]> {
    const rules = await this.rulesService.findAll(user.id);
    this.logger.log(
      `Retrieved ${rules.length} rules for user ${user.id}`,
      rules,
    );
    return rules.map((rule) => RuleDto.fromEntity(rule));
  }

  @Get('fields')
  @ApiOperation({ summary: 'Get available fields and operators for rules' })
  @ApiResponse({ status: 200, schema: { type: 'object' } })
  getFieldDefinitions() {
    return this.rulesService.getFieldDefinitions();
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get rules limits and error messages' })
  @ApiResponse({ status: 200, type: LimitsDto })
  getLimits() {
    return this.rulesService.getLimits();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific rule by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Rule ID' })
  @ApiResponse({ status: 200, type: RuleDto })
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RuleDto> {
    const rule = await this.rulesService.findOne({ userId: user.id, id });
    return RuleDto.fromEntity(rule);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a categorization rule' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Rule ID' })
  @ApiBody({ type: UpdateRuleDto })
  @ApiResponse({ status: 200, type: RuleDto })
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ): Promise<RuleDto> {
    const rule = await this.rulesService.update(user.id, id, updateRuleDto);
    return RuleDto.fromEntity(rule);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a categorization rule' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Rule ID' })
  @ApiResponse({ status: 200, type: RuleDto })
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RuleDto> {
    const deleted = await this.rulesService.remove(user.id, id);
    if (!deleted) {
      throw new NotFoundException(`Rule with ID "${id}" not found`);
    }
    return RuleDto.fromEntity(deleted);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder categorization rules' })
  @ApiBody({ type: ReorderRulesDto })
  @ApiResponse({ status: 200, type: [RuleDto] })
  async reorderRules(
    @RequestUser() user: UserPrincipal,
    @Body() reorderDto: ReorderRulesDto,
  ): Promise<RuleDto[]> {
    const rules = await this.rulesService.reorderRules(
      user.id,
      reorderDto.ruleIds,
    );
    return rules.map((rule) => RuleDto.fromEntity(rule));
  }

  @Post(':id/conditions/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder conditions within a rule' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Rule ID' })
  @ApiBody({ type: ReorderConditionsDto })
  @ApiResponse({ status: 200, type: RuleDto })
  async reorderConditions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reorderDto: ReorderConditionsDto,
  ): Promise<RuleDto> {
    const rule = await this.rulesService.reorderConditions(
      user.id,
      id,
      reorderDto.conditionIds,
    );
    return RuleDto.fromEntity(rule);
  }

  @Get('evaluate/:id')
  @ApiOperation({ summary: 'Evaluate a transaction by ID against all rules' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Transaction ID' })
  @ApiResponse({ status: 200, type: RuleEvaluationResultDto })
  async evaluateTransactionById(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) transactionId: string,
  ): Promise<RuleEvaluationResultDto> {
    const transaction = await this.transactionsService.findUserTransaction({
      userId: user.id,
      transactionId,
    });
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID "${transactionId}" not found`,
      );
    }
    const result = await this.rulesService.evaluateTransaction({
      userId: user.id,
      transaction,
    });

    return {
      categoryId: result.categoryId,
      matchedRuleId: result.matchedRuleId,
    };
  }
}
