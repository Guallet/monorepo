import {
    useNordigenKeys,
    useNordigenKeysMutations,
} from "@guallet/api-react";
import {
    Stack,
    TextInput,
    Button,
    Group,
    Text,
    Badge,
    Card,
    ActionIcon,
    Title,
    Loader,
    Center,
    Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { ResponsiveModal } from "@guallet/ui-react";
import { useState } from "react";
import {
    IconTrash,
    IconPlus,
    IconEdit,
    IconAlertCircle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { BaseScreen } from "@/components/Screens/BaseScreen";

export function NordigenCredentialsScreen() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { keys, isLoading } = useNordigenKeys();
    const { createMutation, deleteMutation, updateMutation } =
        useNordigenKeysMutations();
    const [isModalOpen, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [secretId, setSecretId] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setName("");
        setSecretId("");
        setSecretKey("");
        setEditingKey(null);
        setError(null);
    };

    const handleOpenModal = () => {
        resetForm();
        openModal();
    };

    const handleEditKey = (key: {
        id: string;
        name: string;
        secret_id_masked: string;
    }) => {
        setEditingKey(key.id);
        setName(key.name);
        setSecretId(""); // Don't pre-fill secret ID for security
        setSecretKey(""); // Don't pre-fill secret key for security
        openModal();
    };

    const handleSave = () => {
        setError(null);

        if (!name.trim() || !secretId.trim() || !secretKey.trim()) {
            setError(
                t(
                    "screens.nordigenKeys.notifications.validationError.message",
                    "Please fill in all required fields"
                )
            );
            return;
        }

        if (editingKey) {
            // Update existing key
            updateMutation.mutate(
                {
                    id: editingKey,
                    request: {
                        name: name.trim(),
                        secret_id: secretId.trim(),
                        secret_key: secretKey.trim(),
                    },
                },
                {
                    onSuccess: () => {
                        notifications.show({
                            title: t(
                                "screens.nordigenKeys.notifications.updateSuccess.title"
                            ),
                            message: t(
                                "screens.nordigenKeys.notifications.updateSuccess.message"
                            ),
                            color: "green",
                        });
                        closeModal();
                        resetForm();
                    },
                    onError: (error: unknown) => {
                        // Check if it's a BadRequest error (400)
                        const isBadRequest =
                            (typeof error === "object" &&
                                error !== null &&
                                "status" in error &&
                                (error as { status: number }).status === 400) ||
                            (error instanceof Error &&
                                error.message.toLowerCase().includes("invalid") &&
                                error.message.toLowerCase().includes("credential"));

                        const errorMessage = isBadRequest
                            ? t(
                                "screens.nordigenKeys.notifications.invalidCredentials",
                                "Invalid Nordigen credentials. Please check your Secret ID and Secret Key."
                            )
                            : error instanceof Error
                                ? error.message
                                : typeof error === "object" &&
                                    error !== null &&
                                    "message" in error
                                    ? String((error as { message: unknown }).message)
                                    : t(
                                        "screens.nordigenKeys.notifications.updateError.defaultMessage",
                                        "Failed to update credential"
                                    );

                        setError(errorMessage);
                    },
                }
            );
        } else {
            // Create new key
            createMutation.mutate(
                {
                    name: name.trim(),
                    secret_id: secretId.trim(),
                    secret_key: secretKey.trim(),
                },
                {
                    onSuccess: () => {
                        notifications.show({
                            title: t(
                                "screens.nordigenKeys.notifications.createSuccess.title"
                            ),
                            message: t(
                                "screens.nordigenKeys.notifications.createSuccess.message"
                            ),
                            color: "green",
                        });
                        closeModal();
                        resetForm();
                    },
                    onError: (error: unknown) => {
                        // Check if it's a BadRequest error (400)
                        const isBadRequest =
                            (typeof error === "object" &&
                                error !== null &&
                                "status" in error &&
                                (error as { status: number }).status === 400) ||
                            (error instanceof Error &&
                                error.message.toLowerCase().includes("invalid") &&
                                error.message.toLowerCase().includes("credential"));

                        const errorMessage = isBadRequest
                            ? t(
                                "screens.nordigenKeys.notifications.invalidCredentials",
                                "Invalid Nordigen credentials. Please check your Secret ID and Secret Key."
                            )
                            : error instanceof Error
                                ? error.message
                                : typeof error === "object" &&
                                    error !== null &&
                                    "message" in error
                                    ? String((error as { message: unknown }).message)
                                    : t(
                                        "screens.nordigenKeys.notifications.createError.defaultMessage",
                                        "Failed to create credential"
                                    );

                        setError(errorMessage);
                    },
                }
            );
        }
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                notifications.show({
                    title: t("screens.nordigenKeys.notifications.deleteSuccess.title"),
                    message: t(
                        "screens.nordigenKeys.notifications.deleteSuccess.message"
                    ),
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

    const handleCredentialClick = (accountIds: string[]) => {
        // If there's only one account, navigate directly to it
        if (accountIds.length === 1) {
            navigate({ to: "/accounts/$id", params: { id: accountIds[0] } });
        } else if (accountIds.length > 1) {
            // If there are multiple accounts, navigate to the accounts list
            // You could also implement a modal to select which account to view
            navigate({ to: "/accounts" });
        }
    };

    if (isLoading) {
        return (
            <BaseScreen>
                <Center h={200}>
                    <Loader size="lg" />
                </Center>
            </BaseScreen>
        );
    }

    return (
        <BaseScreen>
            <Stack>
                <Group justify="space-between" align="center">
                    <Title order={2}>
                        {t("screens.nordigenKeys.screen.title", "Nordigen Credentials")}
                    </Title>
                    <Button leftSection={<IconPlus size={16} />} onClick={handleOpenModal}>
                        {t("screens.nordigenKeys.screen.addButton", "Add Credential")}
                    </Button>
                </Group>

                <Text size="sm" c="dimmed">
                    {t(
                        "screens.nordigenKeys.screen.description",
                        "Manage your Nordigen API credentials. Each credential can be linked to multiple bank accounts."
                    )}
                </Text>

                {keys.length === 0 ? (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        title={t(
                            "screens.nordigenKeys.screen.noCredentials.title",
                            "No credentials configured"
                        )}
                        color="blue"
                    >
                        {t(
                            "screens.nordigenKeys.screen.noCredentials.message",
                            "You haven't added any Nordigen credentials yet. Click the 'Add Credential' button to get started."
                        )}
                    </Alert>
                ) : (
                    <Stack gap="md">
                        {keys.map((key) => (
                            <Card
                                key={key.id}
                                withBorder
                                padding="lg"
                                style={{ cursor: key.account_ids.length > 0 ? "pointer" : "default" }}
                                onClick={() => {
                                    if (key.account_ids.length > 0) {
                                        handleCredentialClick(key.account_ids);
                                    }
                                }}
                            >
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap="xs" style={{ flex: 1 }}>
                                        <Group gap="sm">
                                            <Text fw={600} size="lg">
                                                {key.name}
                                            </Text>
                                            <Badge color="blue" variant="light">
                                                {t("screens.nordigenKeys.screen.accountCount", {
                                                    count: key.account_ids.length,
                                                    defaultValue: `${key.account_ids.length} account${key.account_ids.length !== 1 ? "s" : ""
                                                        }`,
                                                })}
                                            </Badge>
                                        </Group>
                                        <Text size="sm" c="dimmed">
                                            {t("screens.nordigenKeys.screen.secretId", "Secret ID")}:{" "}
                                            {key.secret_id_masked}
                                        </Text>
                                        {key.last_error_message && (
                                            <Badge color="red" variant="light">
                                                {t("screens.nordigenKeys.errorBadge", {
                                                    message: key.last_error_message,
                                                })}
                                            </Badge>
                                        )}
                                    </Stack>
                                    <Group gap="xs">
                                        <ActionIcon
                                            variant="subtle"
                                            color="blue"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditKey(key);
                                            }}
                                        >
                                            <IconEdit size={18} />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(key.id);
                                            }}
                                            loading={deleteMutation.isPending}
                                        >
                                            <IconTrash size={18} />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                )}

                <ResponsiveModal
                    opened={isModalOpen}
                    onClose={() => {
                        closeModal();
                        resetForm();
                    }}
                    title={
                        editingKey
                            ? t("screens.nordigenKeys.modal.editTitle", "Edit Credential")
                            : t("screens.nordigenKeys.modal.title", "Add New Credential")
                    }
                    overlayProps={{
                        backgroundOpacity: 0.55,
                        blur: 3,
                    }}
                >
                    <Stack>
                        <Text size="sm" c="dimmed">
                            {t(
                                "screens.nordigenKeys.modal.description",
                                "Enter your Nordigen API credentials. You can get these from your Nordigen dashboard."
                            )}
                        </Text>

                        {error && (
                            <Alert
                                icon={<IconAlertCircle size={16} />}
                                title={t(
                                    "screens.nordigenKeys.modal.error.title",
                                    "Error"
                                )}
                                color="red"
                                withCloseButton
                                onClose={() => setError(null)}
                            >
                                {error}
                            </Alert>
                        )}

                        <TextInput
                            label={t("screens.nordigenKeys.form.name.label", "Name")}
                            placeholder={t(
                                "screens.nordigenKeys.form.name.placeholder",
                                "e.g., My Bank Credentials"
                            )}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <TextInput
                            label={t("screens.nordigenKeys.form.secretId.label", "Secret ID")}
                            placeholder={t(
                                "screens.nordigenKeys.form.secretId.placeholder",
                                "Enter your Nordigen Secret ID"
                            )}
                            value={secretId}
                            onChange={(e) => setSecretId(e.target.value)}
                            required
                        />

                        <TextInput
                            label={t(
                                "screens.nordigenKeys.form.secretKey.label",
                                "Secret Key"
                            )}
                            placeholder={t(
                                "screens.nordigenKeys.form.secretKey.placeholder",
                                "Enter your Nordigen Secret Key"
                            )}
                            type="password"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            required
                        />

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    closeModal();
                                    resetForm();
                                }}
                            >
                                {t("screens.nordigenKeys.modal.cancelButton", "Cancel")}
                            </Button>
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={handleSave}
                                loading={
                                    createMutation.isPending || updateMutation.isPending
                                }
                            >
                                {editingKey
                                    ? t("screens.nordigenKeys.form.updateButton", "Update")
                                    : t("screens.nordigenKeys.form.addButton", "Add")}
                            </Button>
                        </Group>
                    </Stack>
                </ResponsiveModal>
            </Stack>
        </BaseScreen>
    );
}