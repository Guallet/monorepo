import { PartialType } from '@nestjs/swagger';
import { CreateSavingGoalDto } from './create-saving-goal.dto.js';

export class UpdateSavingGoalDto extends PartialType(CreateSavingGoalDto) {}
