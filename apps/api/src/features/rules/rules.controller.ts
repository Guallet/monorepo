import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { RuleDto } from './dto/rule.dto';
import { ReorderRulesDto, ReorderConditionsDto } from './dto/reorder-rules.dto';
import {
  EvaluateTransactionDto,
  EvaluationResultDto,
} from './dto/evaluate-transaction.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Categorization Rules')
@Controller('rules')
export class RulesController {
  private readonly logger = new Logger(RulesController.name);

  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new categorization rule' })
  @ApiResponse({ status: 201, type: RuleDto })
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createRuleDto: CreateRuleDto,
  ): Promise<RuleDto> {
    const rule = await this.rulesService.create(user.id, createRuleDto);
    return RuleDto.fromEntity(rule);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categorization rules' })
  @ApiResponse({ status: 200, type: [RuleDto] })
  async findAll(@RequestUser() user: UserPrincipal): Promise<RuleDto[]> {
    const rules = await this.rulesService.findAll(user.id);
    return rules.map((rule) => RuleDto.fromEntity(rule));
  }

  @Get('fields')
  @ApiOperation({ summary: 'Get available fields and operators for rules' })
  getFieldDefinitions() {
    return this.rulesService.getFieldDefinitions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific rule by ID' })
  @ApiResponse({ status: 200, type: RuleDto })
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<RuleDto> {
    const rule = await this.rulesService.findOne(user.id, id);
    return RuleDto.fromEntity(rule);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a categorization rule' })
  @ApiResponse({ status: 200, type: RuleDto })
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ): Promise<RuleDto> {
    const rule = await this.rulesService.update(user.id, id, updateRuleDto);
    return RuleDto.fromEntity(rule);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a categorization rule' })
  @ApiResponse({ status: 204 })
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<void> {
    await this.rulesService.remove(user.id, id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder categorization rules' })
  @ApiResponse({ status: 200, type: [RuleDto] })
  async reorderRules(
    @RequestUser() user: UserPrincipal,
    @Body() reorderDto: ReorderRulesDto,
  ): Promise<RuleDto[]> {
    const rules = await this.rulesService.reorderRules(user.id, reorderDto.ruleIds);
    return rules.map((rule) => RuleDto.fromEntity(rule));
  }

  @Post(':id/conditions/reorder')
  @ApiOperation({ summary: 'Reorder conditions within a rule' })
  @ApiResponse({ status: 200, type: RuleDto })
  async reorderConditions(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() reorderDto: ReorderConditionsDto,
  ): Promise<RuleDto> {
    const rule = await this.rulesService.reorderConditions(
      user.id,
      id,
      reorderDto.conditionIds,
    );
    return RuleDto.fromEntity(rule);
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate a transaction against all rules' })
  @ApiResponse({ status: 200, type: EvaluationResultDto })
  async evaluateTransaction(
    @RequestUser() user: UserPrincipal,
    @Body() transactionDto: EvaluateTransactionDto,
  ): Promise<EvaluationResultDto> {
    return this.rulesService.evaluateTransaction(user.id, {
      id: transactionDto.id,
      accountId: transactionDto.accountId ?? null,
      description: transactionDto.description ?? null,
      amount: transactionDto.amount,
      date: transactionDto.date,
    });
  }
}
