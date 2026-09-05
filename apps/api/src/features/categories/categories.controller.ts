import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { CategoryDto } from './dto/category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List the current user’s categories' })
  @ApiResponse({ status: 200, type: [CategoryDto] })
  async findAll(@RequestUser() user: UserPrincipal): Promise<CategoryDto[]> {
    const categories = await this.categoriesService.findAllUserCategories(
      user.id,
    );

    return categories.map((category) => CategoryDto.fromDomain(category));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Category ID' })
  @ApiResponse({ status: 200, type: CategoryDto })
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<CategoryDto> {
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
  @ApiOperation({ summary: 'Create a category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, type: CategoryDto })
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    const category = await this.categoriesService.create({
      user_id: user.id,
      dto: createCategoryDto,
    });
    return CategoryDto.fromDomain(category);
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Create the default categories for the current user',
  })
  @ApiResponse({ status: 201, type: [CategoryDto] })
  async createDefaultCategoriesForUser(
    @RequestUser() user: UserPrincipal,
  ): Promise<CategoryDto[]> {
    const defaultCategories =
      await this.categoriesService.createDefaultCategoriesForUser(user.id);
    return defaultCategories.map((category) =>
      CategoryDto.fromDomain(category),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, type: CategoryDto })
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    const updatedCategory = await this.categoriesService.update({
      user_id: user.id,
      category_id: id,
      dto: updateCategoryDto,
    });
    return CategoryDto.fromDomain(updatedCategory);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Category ID' })
  @ApiResponse({ status: 200, type: CategoryDto })
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<CategoryDto> {
    const deletedCategory = await this.categoriesService.removeUserCategory({
      user_id: user.id,
      category_id: id,
    });

    return CategoryDto.fromDomain(deletedCategory);
  }
}
