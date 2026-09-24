import {
  Alert,
  Button,
  Card,
  Center,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useAuth } from '@guallet/auth';
import { useTheme } from '@guallet/ui-react';

export const Route = createFileRoute('/mcp/authorize')({
  validateSearch: z.object({ requestId: z.string().uuid() }),
  component: McpAuthorizePage,
});

interface AuthorizationRequest {
  clientName: string;
  scopes: string[];
  expiresAt: string;
}

function McpAuthorizePage() {
  const { requestId } = Route.useSearch();
  const { isLoading, isAuthenticated } = useAuth();
  const { spacing } = useTheme();
  const [request, setRequest] = useState<AuthorizationRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mcpUrl = import.meta.env.VITE_MCP_URL ?? 'http://localhost:5100';
  const redirect = `/mcp/authorize?requestId=${encodeURIComponent(requestId)}`;

  useEffect(() => {
    let cancelled = false;
    void fetch(`${mcpUrl}/oauth/requests/${requestId}`)
      .then(async (response) => {
        if (!response.ok)
          throw new Error('This authorization request is expired.');
        return (await response.json()) as AuthorizationRequest;
      })
      .then((value) => {
        if (!cancelled) setRequest(value);
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(
            reason instanceof Error
              ? reason.message
              : 'Unable to load authorization request.',
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingRequest(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mcpUrl, requestId]);

  if (isLoading || loadingRequest) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect }} replace />;
  }
  if (!request) {
    return (
      <Center mih="100vh" p="md">
        <Alert color="red">
          {error ?? 'Authorization request unavailable.'}
        </Alert>
      </Center>
    );
  }

  const approve = async (approved: boolean) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/mcp/oauth/approve`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ requestId, approved }),
        },
      );
      if (!response.ok)
        throw new Error('The authorization request could not be completed.');
      const result = (await response.json()) as { redirectUrl: string };
      globalThis.location.assign(result.redirectUrl);
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'The authorization request could not be completed.',
      );
      setSubmitting(false);
    }
  };

  return (
    <Center mih="100vh" p="md">
      <Card
        maw={480}
        w="100%"
        radius="lg"
        shadow="sm"
        withBorder
        p={spacing.lg}
      >
        <Stack gap="md">
          <div>
            <Title order={2}>Connect an AI client</Title>
            <Text c="dimmed" mt="xs">
              {request.clientName} is requesting read-only access to your
              Guallet data.
            </Text>
          </div>
          {error && <Alert color="red">{error}</Alert>}
          <div>
            <Text fw={600}>Requested access</Text>
            <Text size="sm" c="dimmed" mt="xs">
              {request.scopes.join(', ')}
            </Text>
          </div>
          <Stack gap="sm">
            <Button loading={submitting} onClick={() => void approve(true)}>
              Allow access
            </Button>
            <Button
              variant="default"
              disabled={submitting}
              onClick={() => void approve(false)}
            >
              Deny
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Center>
  );
}
