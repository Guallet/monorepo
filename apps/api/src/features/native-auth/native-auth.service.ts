import { Injectable, BadRequestException } from '@nestjs/common';
import { NativeHandoffBroker } from './native-handoff.broker';
import { NativeAuthGateway } from './native-auth.gateway';
import type {
  CompleteNativeResetDto,
  RedeemNativeFlowDto,
  StartNativeFlowDto,
  StartNativeResetDto,
} from './dto/native-auth.dto';

@Injectable()
export class NativeAuthService {
  constructor(
    private readonly broker: NativeHandoffBroker,
    private readonly gateway: NativeAuthGateway,
  ) {}
  async createGoogle({ challenge }: StartNativeFlowDto) {
    const flow = await this.broker.create('google', challenge);
    return {
      ...flow,
      browserUrl: `${this.broker.baseUrl}/native-auth/google/start?flowId=${flow.flowId}`,
    };
  }
  async createReset({ email, challenge }: StartNativeResetDto) {
    const flow = await this.broker.create('reset', challenge, email);
    await this.gateway.requestReset({
      email,
      redirectTo: this.broker.callback(flow.flowId, 'reset'),
    });
    return flow;
  }
  async startGoogle({ flowId: id }: { flowId: string }) {
    const binding = await this.broker.startGoogle(id);
    const result = await this.gateway.startGoogle({
      callbackURL: this.broker.callback(id, 'google'),
    });
    return { ...result, binding };
  }
  async exchangeGoogle({ flowId: id, code, verifier }: RedeemNativeFlowDto) {
    const payload = await this.broker.redeem('google', id, code, verifier);
    if (!payload.cookie)
      throw new BadRequestException('Google sign-in did not return a session.');
    return payload.cookie;
  }
  async finishReset({
    flowId: id,
    code,
    verifier,
    newPassword: password,
  }: CompleteNativeResetDto) {
    const payload = await this.broker.redeem('reset', id, code, verifier);
    if (!payload.resetToken)
      throw new BadRequestException('Invalid password reset.');
    await this.gateway.resetPassword({
      token: payload.resetToken,
      newPassword: password,
    });
    return { success: true };
  }
}
