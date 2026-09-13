import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty({ required: false })
  colour?: string;

  @ApiProperty({
    required: false,
    format: 'uuid',
    nullable: true,
  })
  parentId?: string | null;
}
