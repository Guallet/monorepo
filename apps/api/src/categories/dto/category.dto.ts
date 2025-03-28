import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

export class CategoryDto {
  @ApiProperty({ description: 'The id of the category' })
  id: string;

  @ApiProperty({ description: 'The name of the category' })
  name: string;

  @ApiProperty({ description: 'The icon of the category' })
  icon: string | null;

  @ApiProperty({ description: 'The color of the category' })
  colour: string | null;

  @ApiProperty({ description: 'The parent of the category', nullable: true })
  parentId: string | null;

  static fromDomain(domain: Category): CategoryDto {
    return {
      id: domain.id,
      name: domain.name,
      icon: domain.icon ?? null,
      colour: domain.colour ?? null,
      parentId: domain.parentId ?? null,
    };
  }
}
