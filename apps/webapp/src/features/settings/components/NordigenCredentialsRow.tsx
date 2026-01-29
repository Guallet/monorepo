import {
  useNordigenKeys,
  useNordigenKeysMutations,
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
  Card,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { BaseRow } from "@guallet/ui-react";
import { useState } from "react";
import { IconTrash, IconPlus } from "@tabler/icons-react";

export function NordigenCredentialsRow() {
  const { keys, isLoading } = useNordigenKeys();
  const { createMutation, deleteMutation } = useNordigenKeysMutations();
  const [isModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [name, setName] = useState("");
  const [secretId, setSecretId] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const resetForm = () => {
    setName("");
    setSecretId("");
    setSecretKey("");
  };

  const handleOpenModal = () => {
    resetForm();
    openModal();
  };

  const handleSave = () => {
    if (!name.trim() || !secretId.trim() || !secretKey.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill in all required fields",
        color: "red",
      });
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        secret_id: secretId.trim(),
        secret_key: secretKey.trim(),
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Nordigen key created successfully",
            color: "green",
          });
          closeModal();
          resetForm();
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === "object" &&
                error !== null &&
                "message" in error
                ? String((error as { message: unknown }).message)
                : "Failed to create Nordigen key. Please check your credentials.";

          notifications.show({
            title: "Invalid Credentials",
            message: errorMessage,
            color: "red",
            autoClose: 10000,
          });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Nordigen key removed",
          color: "green",
        });
      },
      onError: () => {
        notifications.show({
          title: "Error",
          message: "Failed to remove Nordigen key",
          color: "red",
        });
      },
    });
  };

  const getDisplayValue = () => {
    if (isLoading) return "Loading...";
    if (keys.length > 0) {
      return `${keys.length} key${keys.length > 1 ? "s" : ""} configured`;
    }
    return "Not configured";
  };

  return (
    <>
      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        title="Nordigen API Keys"
        centered
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Enter your Nordigen (GoCardless) API credentials to enable automatic
            bank account synchronization. You can add multiple keys and link
            specific accounts to each key.
          </Text>

          {keys.length > 0 && (
            <Stack gap="xs">
              <Text fw={500}>Existing Keys</Text>
              {keys.map((key) => (
                <Card key={key.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <Stack gap={2}>
                      <Text fw={500}>{key.name}</Text>
                      <Text size="sm" c="dimmed">
                        {key.secret_id_masked}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {key.account_ids.length} account
                        {key.account_ids.length !== 1 ? "s" : ""} linked
                      </Text>
                    </Stack>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(key.id)}
                      loading={deleteMutation.isPending}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                  {key.last_error_message && (
                    <Badge color="red" variant="light" mt="xs">
                      Error: {key.last_error_message}
                    </Badge>
                  )}
                </Card>
              ))}
            </Stack>
          )}

          <Card withBorder padding="md">
            <Stack>
              <Text fw={500}>Add New Key</Text>
              <TextInput
                label="Name"
                placeholder="e.g., My Bank API Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

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

              <Group justify="flex-end">
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleSave}
                  loading={createMutation.isPending}
                >
                  Add Key
                </Button>
              </Group>
            </Stack>
          </Card>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
      <BaseRow
        label="Nordigen API Keys"
        value={getDisplayValue()}
        rightSection={<IconChevronRight />}
        onClick={handleOpenModal}
      />
    </>
  );
}
