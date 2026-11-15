import type { GualletClientImpl } from '../GualletClient';
import type {
  CompleteNativeResetRequest,
  NativeAuthResultDto,
  NativeFlowDto,
  NativeGoogleFlowDto,
  RedeemNativeFlowRequest,
  StartNativeFlowRequest,
  StartNativeResetRequest,
} from './native-auth.models';
const NATIVE_AUTH_PATH = 'native-auth';
const nativeOptions = { headers: { Origin: 'guallet-android://' } };
/** Requires a native HTTP runtime. A browser must not spoof the native Origin. */
export class NativeAuthApi {
  constructor(private readonly client: GualletClientImpl) {}
  startGoogle(request: StartNativeFlowRequest): Promise<NativeGoogleFlowDto> {
    return this.client.post({
      path: `${NATIVE_AUTH_PATH}/google`,
      payload: request,
      options: nativeOptions,
    });
  }
  requestReset(request: StartNativeResetRequest): Promise<NativeFlowDto> {
    return this.client.post({
      path: `${NATIVE_AUTH_PATH}/reset`,
      payload: request,
      options: nativeOptions,
    });
  }
  exchangeGoogle(
    request: RedeemNativeFlowRequest,
  ): Promise<NativeAuthResultDto> {
    return this.client.post({
      path: `${NATIVE_AUTH_PATH}/google/exchange`,
      payload: request,
      options: nativeOptions,
    });
  }
  completeReset(
    request: CompleteNativeResetRequest,
  ): Promise<NativeAuthResultDto> {
    return this.client.post({
      path: `${NATIVE_AUTH_PATH}/reset/complete`,
      payload: request,
      options: nativeOptions,
    });
  }
}
