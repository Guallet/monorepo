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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@RequestUser() user: UserPrincipal) {
    return this.categoriesService.findAllUserCategories(user.id);
  }

  @Get(':id')
  findOne(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    return this.categoriesService.findUserCategory({
      id: id,
      user_id: user.id,
    });
  }

  @Post()
  create(
    @RequestUser() user: UserPrincipal,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create({
      user_id: user.id,
      dto: createCategoryDto,
    });
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
  remove(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    return this.categoriesService.removeUserCategory({
      user_id: user.id,
      category_id: id,
    });
  }
}
