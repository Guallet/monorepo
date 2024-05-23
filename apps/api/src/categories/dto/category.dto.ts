import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

export class CategoryDto {
  @ApiProperty({ description: 'The id of the category' })
  id: string;

  @ApiProperty({ description: 'The name of the category' })
  name: string;

  @ApiProperty({ description: 'The icon of the category' })
  icon: string;

  @ApiProperty({ description: 'The color of the category' })
<<<<<<< HEAD
  colour: string;
=======
  color: string;
>>>>>>> ba84897 (Develop into Main (#19))

  @ApiProperty({ description: 'The parent of the category', nullable: true })
  parentId?: string;

  static fromDomain(domain: Category): CategoryDto {
    return {
      id: domain.id,
      name: domain.name,
      icon: domain.icon,
<<<<<<< HEAD
      colour: domain.colour,
=======
      color: domain.colour,
>>>>>>> ba84897 (Develop into Main (#19))
      parentId: domain.parentId,
    };
  }
}
