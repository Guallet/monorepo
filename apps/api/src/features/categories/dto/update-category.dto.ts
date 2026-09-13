import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

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
