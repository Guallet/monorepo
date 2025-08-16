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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { ApiTags } from '@nestjs/swagger';
import { BudgetDto } from './dto/budget.dto';

@Controller('budgets')
@ApiTags('Budgets')
export class BudgetsController {
  private readonly logger = new Logger(BudgetsController.name);

  constructor(private readonly budgetsService: BudgetsService) {}

  // @Post()
  // create(@Body() createBudgetDto: CreateBudgetDto) {
  //   return this.budgetsService.create(createBudgetDto);
  // }

  @Get()
  async findAll(@RequestUser() user: UserPrincipal): Promise<BudgetDto[]> {
    const budgets = await this.budgetsService.findAllForUser(user.id);
    // TODO: Calculate the spent budget in the given timeframe
    return budgets.map((budget) => BudgetDto.fromDomain(budget, 0));
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @RequestUser() user: UserPrincipal,
  ): Promise<BudgetDto> {
    const budget = await this.budgetsService.findOneForUser({
      id: id,
      userId: user.id,
    });
    // TODO: Calculate the spent budget in the given timeframe
    return BudgetDto.fromDomain(budget, 0);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
  //   return this.budgetsService.update(+id, updateBudgetDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.budgetsService.remove(+id);
  // }
}
