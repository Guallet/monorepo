import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { NativeFlowStore, NATIVE_AUTH_QUEUE } from './native-flow.store';
import { NativeHandoffBroker } from './native-handoff.broker';
import { NativeAuthGateway } from './native-auth.gateway';
import { NativeAuthService } from './native-auth.service';
import { NativeAuthController } from './native-auth.controller';

// Separate from AuthService so createAuth can use the broker without a DI cycle.
@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: NATIVE_AUTH_QUEUE }),
  ],
  providers: [NativeFlowStore, NativeHandoffBroker],
  exports: [NativeHandoffBroker],
})
export class NativeHandoffModule {}
@Module({
  imports: [NativeHandoffModule],
  providers: [NativeAuthGateway, NativeAuthService],
  controllers: [NativeAuthController],
})
export class NativeAuthModule {}
