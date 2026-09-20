import { categoryIconNames, type CategoryIconName } from '@guallet/theme';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: categoryIconNames })
  @IsIn(categoryIconNames)
  icon: CategoryIconName;

  @ApiProperty()
  @IsString()
  colour: string;

  @ApiProperty({ nullable: true, format: 'uuid' })
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  parentId: string | null;
}
