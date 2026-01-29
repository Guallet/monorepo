import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NordigenService } from './nordigen.service';
import { NordigenUserService } from './nordigen-user.service';

@Module({
  imports: [HttpModule],
  providers: [NordigenService, NordigenUserService],
  exports: [NordigenService, NordigenUserService],
})
export class NordigenModule { }
