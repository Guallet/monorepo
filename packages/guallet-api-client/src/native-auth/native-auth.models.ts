/** Native-only HTTPS endpoints; never persist verifier/password request bodies. */
export type StartNativeFlowRequest = { challenge: string };
export type StartNativeResetRequest = StartNativeFlowRequest & {
  email: string;
};
export type NativeFlowDto = { flowId: string; expiresIn: number };
export type NativeGoogleFlowDto = NativeFlowDto & { browserUrl: string };
export type RedeemNativeFlowRequest = {
  flowId: string;
  code: string;
  verifier: string;
};
export type CompleteNativeResetRequest = RedeemNativeFlowRequest & {
  newPassword: string;
};
export type NativeAuthResultDto = { success: boolean };
