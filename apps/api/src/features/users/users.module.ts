import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UserInitializationService } from './user-initialization.service.js';
import { CategoriesModule } from '../categories/categories.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CategoriesModule],
  controllers: [UsersController],
  providers: [UsersService, UserInitializationService],
  exports: [UsersService],
})
export class UsersModule {}
