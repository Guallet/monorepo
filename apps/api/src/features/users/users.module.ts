import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthAccount } from './entities/auth-account.entity';
import { AuthSession } from './entities/auth-session.entity';
import { AuthVerification } from './entities/auth-verification.entity';
import { UserInitializationService } from './user-initialization.service';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AuthAccount,
      AuthSession,
      AuthVerification,
    ]),
    CategoriesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserInitializationService],
  exports: [UsersService],
})
export class UsersModule {}
