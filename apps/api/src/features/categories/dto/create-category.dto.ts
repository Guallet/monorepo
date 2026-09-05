import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  colour: string;
  @ApiProperty({ nullable: true })
  parentId: string | null;
}
