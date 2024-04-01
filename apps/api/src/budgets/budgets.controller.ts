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
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { ApiTags } from '@nestjs/swagger';

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
  findAll(@RequestUser() user: UserPrincipal) {
    return this.budgetsService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @RequestUser() user: UserPrincipal) {
    return this.budgetsService.findOneForUser({
      id: id,
      userId: user.id,
    });
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
