import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NordigenKey } from './entities/nordigen-key.entity';
import { NordigenKeyAccount } from './entities/nordigen-key-account.entity';
import { NordigenKeysController } from './nordigen-keys.controller';
import { NordigenKeysService } from './nordigen-keys.service';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NordigenKey, NordigenKeyAccount, Account]),
  ],
  controllers: [NordigenKeysController],
  providers: [NordigenKeysService],
  exports: [NordigenKeysService],
})
export class NordigenKeysModule {}
