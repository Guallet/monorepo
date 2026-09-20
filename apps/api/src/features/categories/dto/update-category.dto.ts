import { categoryIconNames, type CategoryIconName } from '@guallet/theme';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, enum: categoryIconNames })
  @IsOptional()
  @IsIn(categoryIconNames)
  icon?: CategoryIconName;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  colour?: string;

  @ApiProperty({
    required: false,
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
