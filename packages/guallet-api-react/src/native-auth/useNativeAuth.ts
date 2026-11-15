import type {
  CompleteNativeResetRequest,
  RedeemNativeFlowRequest,
  StartNativeFlowRequest,
  StartNativeResetRequest,
} from '@guallet/api-client';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useGualletClient } from '../GualletClientProvider';

/** Native-only flow starters. Verifiers and passwords deliberately bypass query/mutation caches. */
export function useNativeAuth() {
  const client = useGualletClient();
  const startGoogle = useMutation({
    mutationFn: (request: StartNativeFlowRequest) =>
      client.nativeAuth.startGoogle(request),
    gcTime: 0,
  });
  const requestReset = useMutation({
    mutationFn: (request: StartNativeResetRequest) =>
      client.nativeAuth.requestReset(request),
    gcTime: 0,
  });
  const exchangeGoogle = useCallback(
    (request: RedeemNativeFlowRequest) =>
      client.nativeAuth.exchangeGoogle(request),
    [client],
  );
  const completeReset = useCallback(
    (request: CompleteNativeResetRequest) =>
      client.nativeAuth.completeReset(request),
    [client],
  );
  return { startGoogle, requestReset, exchangeGoogle, completeReset };
}
