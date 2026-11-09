import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredential } from './entities/user-credential.entity';
import { UserCredentialsService } from './user-credentials.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserCredential])],
  providers: [UserCredentialsService],
  exports: [UserCredentialsService],
})
export class UserCredentialsModule {}
