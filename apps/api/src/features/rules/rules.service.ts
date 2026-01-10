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
    private readonly rulesRepository: Repository<Rule>,

    @InjectRepository(RuleCondition)
    private readonly conditionsRepository: Repository<RuleCondition>,
  ) {}

  create(createRuleDto: CreateRuleDto) {
    this.logger.debug(`Creating a new rule`, createRuleDto);
    return 'This action adds a new rule';
  }

  async findAll(args: { userId: string }): Promise<Rule[]> {
    return this.rulesRepository.find({
      relations: ['conditions'],
      where: { user_id: args.userId },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} rule`;
  }

  update(id: number, updateRuleDto: UpdateRuleDto) {
    this.logger.debug(`Updating rule ${id}`, updateRuleDto);
    return `This action updates a #${id} rule`;
  }

  remove(id: number) {
    return `This action removes a #${id} rule`;
  }
}
