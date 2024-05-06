import { useNavigate, notFound, createFileRoute } from "@tanstack/react-router";
import { Group, Modal, Stack, Text, Button, Loader } from "@mantine/core";
import { fetch_delete } from "@core/api/fetchHelper";
import { CurrentAccountDetails } from "@/features/accounts/AccountDetails/CurrentAccountDetails";
import { CreditCardDetails } from "@/features/accounts/AccountDetails/CreditCardDetails";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { AccountDto, AccountTypeDto } from "@guallet/api-client";
import { useAccount } from "@guallet/api-react";

export const Route = createFileRoute("/_app/accounts/$id")({
  component: AccountDetailsPage,
  // loader: async ({ params }) => loader(params.id),
  notFoundComponent: () => {
    return <p>Account not found</p>;
  },
  errorComponent: (error) => {
    console.error("Error loading account", error);
    return (
      <Stack>
        <Text>Error loading account</Text>
        <Text>{`${JSON.stringify(error)}`}</Text>
      </Stack>
    );
  },
});

// async function loader(id: string): Promise<AccountDto> {
//   try {
//     // return await getAccount(id);
//     return await gualletClient.accounts.get(id);
//   } catch (error) {
//     console.error("Error loading account", error);
//     if (error instanceof ApiError) {
//       switch (error.status) {
//         case 404:
//           // https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors
//           throw notFound();
//         default:
//           console.error("Unhandled error", error);
//           throw error;
//       }
//     }
//     throw error;
//   }
// }

function AccountDetailsPage() {
  // const account = Route.useLoaderData();
  const { id } = Route.useParams();
  const { account, isLoading, isError } = useAccount(id);
  const navigation = useNavigate();

  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  function showDeleteAccountModal() {
    setIsDeleteAccountModalOpen(true);
  }

  function hideModal() {
    setIsDeleteAccountModalOpen(false);
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!account) {
    throw notFound();
  }

  return (
    <>
      <Modal
        centered
        opened={isDeleteAccountModalOpen}
        onClose={hideModal}
        title="Delete account"
        size="auto"
      >
        <DeleteAccountDialog
          account={account}
          onCancel={hideModal}
          onAccountDeleted={() => {
            notifications.show({
              title: "Account deleted",
              message: "The account has been deleted",
              color: "green",
            });
            navigation({ to: "/accounts" });
          }}
        />
      </Modal>
      <Text size="lg" fw={700}>
        {account.name}
      </Text>

      {/* Show info dependent on account type */}
      {AccountDetailsSelector(account)}

      <Stack justify="flex-start">
        <Button
          fullWidth
          onClick={() => {
            navigation({
              to: `/transactions`,
              search: () => ({
                accounts: [account.id],
                page: 1,
                pageSize: 50,
              }),
            });
          }}
        >
          View Transactions
        </Button>
        <Button fullWidth disabled>
          Manage connection
        </Button>
        <Button
          fullWidth
          onClick={() => {
            navigation({ to: `/accounts/$id/edit`, params: { id } });
          }}
        >
          Edit
        </Button>
        <Button fullWidth color="red" onClick={showDeleteAccountModal}>
          Delete
        </Button>
      </Stack>
    </>
  );
}

interface DialogProps {
  account: AccountDto;
  onCancel: () => void;
  onAccountDeleted: () => void;
}
function DeleteAccountDialog({
  account,
  onCancel,
  onAccountDeleted,
}: DialogProps) {
  async function deleteAccount() {
    await fetch_delete(`accounts/${account.id}`);
    onAccountDeleted();
  }

  return (
    <Stack>
      <Text>Are you sure you want to delete the account?</Text>
      <Text size="sm"> This action and cannot be undone.</Text>
      <Group justify="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          color="red"
          onClick={() => {
            deleteAccount();
          }}
        >
          Delete account
        </Button>
      </Group>
    </Stack>
  );
}

function AccountDetailsSelector(account: AccountDto) {
  // TODO: Create different components for each account type
  switch (account.type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return <CurrentAccountDetails account={account} />;
    case AccountTypeDto.CREDIT_CARD:
      return <CreditCardDetails account={account} />;
    default:
      return null;
  }
}
