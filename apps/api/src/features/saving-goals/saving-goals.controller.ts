import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SavingGoalsService } from './saving-goals.service';
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto';
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto';
import { ApiTags } from '@nestjs/swagger';
import { SavingGoalDto } from './dto/saving-goal.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';

@ApiTags('Saving Goals')
@Controller('saving-goals')
export class SavingGoalsController {
  private readonly logger = new Logger(SavingGoalsController.name);

  constructor(private readonly savingGoalsService: SavingGoalsService) {}

  @Post()
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createSavingGoalDto: CreateSavingGoalDto,
  ): Promise<SavingGoalDto> {
    const savingGoal = await this.savingGoalsService.create({
      userId: user.id,
      request: createSavingGoalDto,
    });
    return SavingGoalDto.fromDomain(savingGoal);
  }

  @Get()
  async findAll(@RequestUser() user: UserPrincipal): Promise<SavingGoalDto[]> {
    const goals = await this.savingGoalsService.findAllUserSavingGoals({
      userId: user.id,
    });
    return goals.map((x) => SavingGoalDto.fromDomain(x));
  }

  @Get(':id')
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const goal = await this.savingGoalsService.findByIdForUser({
      id: id,
      userId: user.id,
    });
    return SavingGoalDto.fromDomain(goal);
  }

  @Patch(':id')
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSavingGoalDto: UpdateSavingGoalDto,
  ): Promise<SavingGoalDto> {
    const goal = await this.savingGoalsService.update({
      userId: user.id,
      savingGoalId: id,
      request: updateSavingGoalDto,
    });
    return SavingGoalDto.fromDomain(goal);
  }

  @Delete(':id')
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SavingGoalDto> {
    const goal = await this.savingGoalsService.remove({
      userId: user.id,
      id,
    });
    return SavingGoalDto.fromDomain(goal);
  }
}
