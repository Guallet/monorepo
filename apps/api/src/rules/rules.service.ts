import { Injectable, Logger } from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule, RuleCondition } from './entities/rule.entity';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @InjectRepository(Rule)
    private rulesRepository: Repository<Rule>,

    @InjectRepository(RuleCondition)
    private conditionsRepository: Repository<RuleCondition>,
  ) {}

  create(createRuleDto: CreateRuleDto) {
    return 'This action adds a new rule';
  }

  findAll() {
    return `This action returns all rules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rule`;
  }

  update(id: number, updateRuleDto: UpdateRuleDto) {
    return `This action updates a #${id} rule`;
  }

  remove(id: number) {
    return `This action removes a #${id} rule`;
  }
}
