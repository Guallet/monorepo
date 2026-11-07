import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserCredentialsService } from './user-credentials.service';

@Module({
  imports: [ConfigModule],
  providers: [UserCredentialsService],
  exports: [UserCredentialsService],
})
export class UserCredentialsModule {}
