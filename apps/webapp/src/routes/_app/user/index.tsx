import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDisclosure } from '@/hooks/useDisclosure';
import { gualletClient } from '@/api/gualletClient';
import { useUser } from '@guallet/api-react';
import { ResponsiveModal } from '@guallet/ui-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/user/')({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [
    isDeleteAccountModalOpened,
    {
      open: openDeleteAccountConfirmation,
      close: closeDeleteAccountConfirmation,
    },
  ] = useDisclosure(false);

  const deleteAccount = async () => {
    await gualletClient.user.deleteUserAccount();
    navigate({ to: '/userdeleted', replace: true });
  };

  return (
    <>
      <ResponsiveModal
        opened={isDeleteAccountModalOpened}
        onClose={closeDeleteAccountConfirmation}
        title="Delete your profile"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete your profile? This action is
            destructive and you will have to contact support to restore your
            data.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                closeDeleteAccountConfirmation();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                void deleteAccount();
              }}
            >
              Delete my account
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          <img
            src={
              user?.profile_src ??
              `https://dummyimage.com/200x200/8c8c8c/fff.png&text=${user?.name}`
            }
            alt={user?.name ?? 'User avatar'}
            width={200}
            className="h-auto rounded-full object-contain"
            onError={(event) => {
              event.currentTarget.src = `https://dummyimage.com/200x200/8c8c8c/fff.png&text=${user?.name}`;
            }}
          />
          <p className="text-lg font-semibold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <Button
          type="button"
          onClick={() => {
            navigate({ to: '/user/edit' });
          }}
        >
          Edit Profile
        </Button>
        <Button
          type="button"
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={() => {
            openDeleteAccountConfirmation();
          }}
        >
          Delete account
        </Button>
      </div>
    </>
  );
}
