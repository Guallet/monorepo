import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './entities/budget.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BudgetsService {
  private readonly logger = new Logger(BudgetsService.name);

  constructor(
    @InjectRepository(Budget)
    private repository: Repository<Budget>,
  ) {}

  create(createBudgetDto: CreateBudgetDto) {
    return 'This action adds a new budget';
  }

  async findAllForUser(user_id: string) {
    return await this.repository.find({ where: { user_id } });
  }

  async findOneForUser(args: { userId: string; id: string }) {
    const budget = await this.repository.findOne({
      where: { id: args.id, user_id: args.userId },
    });
    if (!budget) {
      throw new NotFoundException();
    }
    return budget;
  }

  update(id: number, updateBudgetDto: UpdateBudgetDto) {
    return `This action updates a #${id} budget`;
  }

  remove(id: number) {
    return `This action removes a #${id} budget`;
  }
}
