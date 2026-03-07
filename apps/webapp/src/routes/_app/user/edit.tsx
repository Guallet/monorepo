import { useUser } from '@guallet/api-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_app/user/edit')({
  component: EditUserPage,
});

function EditUserPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <form method="post" id="add-account-form" className="space-y-4">
      {/* <input type="hidden" id="accountId" name="accountId" value={account.id} /> */}

      <div className="space-y-2">
        <Label htmlFor="user-name">User name</Label>
        <Input
          id="user-name"
          name="name"
          required
          placeholder="Enter your name"
          defaultValue={user?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-email">User email</Label>
        <Input
          id="user-email"
          name="email"
          type="email"
          required
          placeholder="Enter your email"
          defaultValue={user?.email}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            navigate({
              to: '/user',
            });
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
