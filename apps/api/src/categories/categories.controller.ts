import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/core/auth/requestuser.decorator';
import { UserPrincipal } from 'src/core/auth/user_principal';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryRequestDto } from './dto/create-category-request.dto';
import { UpdateCategoryRequestDto } from './dto/update-category-request.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@RequestUser() user: UserPrincipal): Promise<CategoryDto[]> {
    const categories = await this.categoriesService.findAll(user.id);
    return categories.map((x) => new CategoryDto(x));
  }

  @Post()
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createCategoryDto: CreateCategoryRequestDto,
  ): Promise<CategoryDto> {
    const category = await this.categoriesService.create(createCategoryDto);
    return new CategoryDto(category);
  }

  @Patch(':id')
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryRequestDto,
  ): Promise<CategoryDto> {
    const category = await this.categoriesService.update(
      user.id,
      id,
      updateCategoryDto,
    );
    return new CategoryDto(category);
  }

  @Delete(':id')
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<CategoryDto> {
    const category = await this.categoriesService.remove(user.id, id);
    return new CategoryDto(category);
  }
}
