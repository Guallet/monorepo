import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsString()
  icon: string;
  @ApiProperty()
  @IsString()
  colour: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
