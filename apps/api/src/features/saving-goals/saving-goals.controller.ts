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
  HttpCode,
} from '@nestjs/common';
import { SavingGoalsService } from './saving-goals.service';
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto';
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SavingGoalDto } from './dto/saving-goal.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';

@ApiTags('Saving Goals')
@Controller('saving-goals')
export class SavingGoalsController {
  private readonly logger = new Logger(SavingGoalsController.name);

  constructor(private readonly savingGoalsService: SavingGoalsService) {}

  @ApiBody({ type: SavingGoalDto })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: SavingGoalDto,
  })
  @HttpCode(202)
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

  @ApiResponse({
    description: 'A list of saving goals for the user',
    type: [SavingGoalDto],
  })
  @Get()
  async findAll(@RequestUser() user: UserPrincipal): Promise<SavingGoalDto[]> {
    const goals = await this.savingGoalsService.findAllUserSavingGoals({
      userId: user.id,
    });
    return goals.map((x) => SavingGoalDto.fromDomain(x));
  }

  @ApiParam({
    name: 'id',
    description: 'The ID of the saving goal to retrieve',
  })
  @ApiResponse({
    description: 'The requested saving goal',
    type: SavingGoalDto,
  })
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

  @ApiParam({ name: 'id', description: 'The ID of the saving goal to update' })
  @ApiResponse({
    description: 'The Updated saving goal',
    type: SavingGoalDto,
  })
  @ApiBody({ type: UpdateSavingGoalDto })
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

  @ApiParam({ name: 'id', description: 'The ID of the saving goal to delete' })
  @ApiResponse({
    description: 'The deleted saving goal',
    type: SavingGoalDto,
  })
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
