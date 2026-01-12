import {
  useNordigenCredentials,
  useNordigenCredentialsMutations,
} from "@guallet/api-react";
import { IconChevronRight } from "@tabler/icons-react";
import {
  Modal,
  Stack,
  TextInput,
  Button,
  Group,
  Text,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { BaseRow } from "@guallet/ui-react/";
import { useState } from "react";

export function NordigenCredentialsRow() {
  const { credentials, isLoading } = useNordigenCredentials();
  const { updateNordigenCredentialsMutation, deleteNordigenCredentialsMutation } =
    useNordigenCredentialsMutations();
  const [isModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [secretId, setSecretId] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const handleSave = () => {
    if (!secretId.trim() || !secretKey.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill in both Secret ID and Secret Key",
        color: "red",
      });
      return;
    }

    updateNordigenCredentialsMutation.mutate(
      {
        secret_id: secretId.trim(),
        secret_key: secretKey.trim(),
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Nordigen credentials updated successfully",
            color: "green",
          });
          closeModal();
          setSecretId("");
          setSecretKey("");
        },
        onError: () => {
          notifications.show({
            title: "Error",
            message: "Failed to update Nordigen credentials",
            color: "red",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteNordigenCredentialsMutation.mutate(undefined, {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Nordigen credentials removed",
          color: "green",
        });
        closeModal();
      },
      onError: () => {
        notifications.show({
          title: "Error",
          message: "Failed to remove Nordigen credentials",
          color: "red",
        });
      },
    });
  };

  const getDisplayValue = () => {
    if (isLoading) return "Loading...";
    if (credentials?.has_credentials) {
      return credentials.secret_id_masked || "Configured";
    }
    return "Not configured";
  };

  return (
    <>
      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        title="Nordigen Credentials"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Enter your Nordigen (GoCardless) API credentials to enable automatic
            bank account synchronization. You can get these from the GoCardless
            Bank Account Data dashboard.
          </Text>

          {credentials?.has_credentials && (
            <Badge color="green" variant="light">
              Currently configured: {credentials.secret_id_masked}
            </Badge>
          )}

          <TextInput
            label="Secret ID"
            placeholder="Enter your Nordigen Secret ID"
            value={secretId}
            onChange={(e) => setSecretId(e.target.value)}
            required
          />

          <TextInput
            label="Secret Key"
            placeholder="Enter your Nordigen Secret Key"
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
          />

          <Group justify="space-between" mt="md">
            {credentials?.has_credentials && (
              <Button
                variant="outline"
                color="red"
                onClick={handleDelete}
                loading={deleteNordigenCredentialsMutation.isPending}
              >
                Remove
              </Button>
            )}
            <Group ml="auto">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={updateNordigenCredentialsMutation.isPending}
              >
                Save
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
      <BaseRow
        label="Nordigen Credentials"
        value={getDisplayValue()}
        rightSection={<IconChevronRight />}
        onClick={() => {
          openModal();
        }}
      />
    </>
  );
}
