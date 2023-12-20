import { Avatar, Text, Paper, Button, Stack } from "@mantine/core";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { UserDto, getUserDetails } from "./api/user.api";
import { AppRoutes } from "../../router/AppRoutes";

type LoaderData = {
  user: UserDto;
};
export const loader: LoaderFunction = async ({ params, request }) => {
  const user = await getUserDetails();

  return {
    user,
  } as LoaderData;
};

export function UserDetailsPage() {
  const { user } = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  return (
    <Paper shadow="xs">
      <Avatar src={user.profile_src} alt={user.name} radius="xl" />
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
      {/* <NavLink
        href={AppRoutes.User.EDIT}
        label="Edit Profile"
        rightSection={
          <IconChevronRight
            size="0.8rem"
            stroke={1.5}
            className="mantine-rotate-rtl"
          />
        }
      /> */}
      <Stack>
        <Button
          onClick={() => {
            navigate(AppRoutes.User.EDIT);
          }}
        >
          Edit Profile
        </Button>
      </Stack>
    </Paper>
  );
}
