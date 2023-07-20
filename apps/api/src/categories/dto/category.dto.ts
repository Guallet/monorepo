import { Category } from '../entities/category.entity';

export class CategoryDto {
  id: string;
  name?: string;
  icon?: string;
  colour?: string;
  parentId?: string;

  constructor(category: Category) {
    this.id = category.id;
    this.name = category.name;
    this.icon = category.icon;
    this.colour = category.colour;
    this.parentId = category.parentId;
  }
}
