import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserInitializationService } from './user-initialization.service';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CategoriesModule],
  controllers: [UsersController],
  providers: [UsersService, UserInitializationService],
  exports: [UsersService],
})
export class UsersModule {}
