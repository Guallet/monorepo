import { Text, Button, Stack, Image, Modal, Group } from "@mantine/core";
import { FileRoute, useNavigate } from "@tanstack/react-router";
import { AppRoutes } from "@/router/AppRoutes";
import { useDisclosure } from "@mantine/hooks";
import {
  deleteUserAccount,
  getUserDetails,
} from "@/features/user/api/user.api";

export const Route = new FileRoute("/_app/user/").createRoute({
  loader: loader,
  component: UserDetailsPage,
});

async function loader() {
  const user = await getUserDetails();
  return { user };
}

function UserDetailsPage() {
  const { user } = Route.useLoaderData();
  const navigate = useNavigate();
  const [
    isDeleteAccountModalOpened,
    {
      open: openDeleteAccountConfirmation,
      close: closeDeleteAccountConfirmation,
    },
  ] = useDisclosure(false);

  const deleteAccount = async () => {
    await deleteUserAccount();
    navigate({ to: AppRoutes.APP_ACCOUNT_DELETED });
  };

  return (
    <>
      <Modal
        centered
        opened={isDeleteAccountModalOpened}
        onClose={closeDeleteAccountConfirmation}
        title="Delete your profile"
      >
        <Stack>
          <Text size="sm">
            Are you sure you want to delete your profile? This action is
            destructive and you will have to contact support to restore your
            data.
          </Text>
          <Group justify="flex-end" grow>
            <Button
              onClick={() => {
                closeDeleteAccountConfirmation();
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                deleteAccount();
              }}
            >
              Delete my account
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Stack>
        <Stack align="center">
          <Image
            src={user.profile_src}
            alt={user.name}
            w={200}
            h="auto"
            fit="contain"
            // radius={100}
            fallbackSrc={`https://dummyimage.com/200x200/8c8c8c/fff.png&text=${user.name}`}
            style={{
              borderRadius: "50%",
            }}
          />
          <Text>{user.name}</Text>
          <Text>{user.email}</Text>
        </Stack>
        <Button
          onClick={() => {
            navigate({ to: AppRoutes.User.EDIT });
          }}
        >
          Edit Profile
        </Button>
        <Button
          onClick={() => {
            openDeleteAccountConfirmation();
          }}
          color="red"
        >
          Delete account
        </Button>
      </Stack>
    </>
  );
}
