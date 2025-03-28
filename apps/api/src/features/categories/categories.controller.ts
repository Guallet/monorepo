import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { CategoryDto } from './dto/category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@RequestUser() user: UserPrincipal) {
    const categories = await this.categoriesService.findAllUserCategories(
      user.id,
    );

    return categories.map((category) => CategoryDto.fromDomain(category));
  }

  @Get(':id')
  async findOne(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    const category = await this.categoriesService.findUserCategory({
      id: id,
      user_id: user.id,
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return CategoryDto.fromDomain(category);
  }

  @Post()
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    const category = await this.categoriesService.create({
      user_id: user.id,
      dto: createCategoryDto,
    });
    return CategoryDto.fromDomain(category);
  }

  @Post('seed')
  @HttpCode(201)
  async createDefaultCategoriesForUser(@RequestUser() user: UserPrincipal) {
    return await this.categoriesService.createDefaultCategoriesForUser(user.id);
  }

  @Patch(':id')
  update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update({
      user_id: user.id,
      category_id: id,
      dto: updateCategoryDto,
    });
  }

  @Delete(':id')
  async remove(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    const deletedCategory = await this.categoriesService.removeUserCategory({
      user_id: user.id,
      category_id: id,
    });

    return CategoryDto.fromDomain(deletedCategory);
  }
}
