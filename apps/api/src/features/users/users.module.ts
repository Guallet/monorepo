import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CategoriesModule } from '../categories/categories.module';
import { EmailModule } from '../email/email.module';
import { USER_EVENTS_QUEUE } from './users-events.constants';
import { UserCreatedProcessor } from './processors/user-created.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
      name: USER_EVENTS_QUEUE,
    }),
    CategoriesModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserCreatedProcessor],
  exports: [UsersService],
})
export class UsersModule {}
