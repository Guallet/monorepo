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
import { useTranslation } from "react-i18next";

export function NordigenCredentialsRow() {
  const { t } = useTranslation();
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
        title: t("screens.nordigenKeys.notifications.validationError.title"),
        message: t("screens.nordigenKeys.notifications.validationError.message"),
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
            title: t("screens.nordigenKeys.notifications.createSuccess.title"),
            message: t("screens.nordigenKeys.notifications.createSuccess.message"),
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
                : t("screens.nordigenKeys.notifications.createError.defaultMessage");

          notifications.show({
            title: t("screens.nordigenKeys.notifications.createError.title"),
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
          title: t("screens.nordigenKeys.notifications.deleteSuccess.title"),
          message: t("screens.nordigenKeys.notifications.deleteSuccess.message"),
          color: "green",
        });
      },
      onError: () => {
        notifications.show({
          title: t("screens.nordigenKeys.notifications.deleteError.title"),
          message: t("screens.nordigenKeys.notifications.deleteError.message"),
          color: "red",
        });
      },
    });
  };

  const getDisplayValue = () => {
    if (isLoading) return t("screens.nordigenKeys.row.loading");
    if (keys.length > 0) {
      return t("screens.nordigenKeys.row.configured", { count: keys.length });
    }
    return t("screens.nordigenKeys.row.notConfigured");
  };

  return (
    <>
      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        title={t("screens.nordigenKeys.modal.title")}
        centered
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack>
          <Text size="sm" c="dimmed">
            {t("screens.nordigenKeys.modal.description")}
          </Text>

          {keys.length > 0 && (
            <Stack gap="xs">
              <Text fw={500}>{t("screens.nordigenKeys.modal.existingKeys")}</Text>
              {keys.map((key) => (
                <Card key={key.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <Stack gap={2}>
                      <Text fw={500}>{key.name}</Text>
                      <Text size="sm" c="dimmed">
                        {key.secret_id_masked}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t("screens.nordigenKeys.modal.accountsLinked", {
                          count: key.account_ids.length,
                        })}
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
                      {t("screens.nordigenKeys.errorBadge", {
                        message: key.last_error_message,
                      })}
                    </Badge>
                  )}
                </Card>
              ))}
            </Stack>
          )}

          <Card withBorder padding="md">
            <Stack>
              <Text fw={500}>{t("screens.nordigenKeys.modal.addNewKey")}</Text>
              <TextInput
                label={t("screens.nordigenKeys.form.name.label")}
                placeholder={t("screens.nordigenKeys.form.name.placeholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <TextInput
                label={t("screens.nordigenKeys.form.secretId.label")}
                placeholder={t("screens.nordigenKeys.form.secretId.placeholder")}
                value={secretId}
                onChange={(e) => setSecretId(e.target.value)}
                required
              />

              <TextInput
                label={t("screens.nordigenKeys.form.secretKey.label")}
                placeholder={t("screens.nordigenKeys.form.secretKey.placeholder")}
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
                  {t("screens.nordigenKeys.form.addButton")}
                </Button>
              </Group>
            </Stack>
          </Card>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeModal}>
              {t("screens.nordigenKeys.modal.closeButton")}
            </Button>
          </Group>
        </Stack>
      </Modal>
      <BaseRow
        label={t("screens.nordigenKeys.row.label")}
        value={getDisplayValue()}
        rightSection={<IconChevronRight />}
        onClick={handleOpenModal}
      />
    </>
  );
}
