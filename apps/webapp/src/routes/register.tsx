import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useAuth } from "@/auth/useAuth";
import {
  Container,
  Paper,
  Title,
  Stack,
  TextInput,
  PasswordInput,
  Group,
  Checkbox,
  Anchor,
  Text,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconExclamationMark } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RouteComponent() {
  const { createAccount, login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If there is already a logged in user, just navigate away from here. Force the user to logout before create a new account
    if (!isLoading && isAuthenticated) {
      navigate({
        to: "/dashboard",
      });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 characters" : null,

      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),

      password: (value) =>
        value.length < 6 ? "Password must have at least 6 characters" : null,

      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    // Handle form submission

    console.log("Form values:", values);
    // Make request to API
    try {
      await createAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      // if user create, then login it and redirect to dashboard
      await login(values.email, values.password);
      navigate({ to: "/dashboard" });
    } catch (e) {
      console.error("Not possible to create the user", e);
      notifications.show({
        title: "Error creating account",
        message: `It's not possible to create the account. Please try again later. ${e}`,
        color: "red",
        icon: <IconExclamationMark />,
        withBorder: true,
      });
    }
  };

  return (
    <BaseScreen>
      <Container size={450}>
        {/* <LoginScreenHeader /> */}
        <Paper withBorder shadow="md" p={30} radius="md">
          <Title order={2} ta="center" mb="md">
            Create new account
          </Title>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                {...form.getInputProps("name")}
                key={form.key("name")}
                label="Name"
                placeholder="Enter your name"
                required
              />
              <TextInput
                {...form.getInputProps("email")}
                key={form.key("email")}
                label="Email address"
                placeholder="Enter your email"
                required
              />
              <PasswordInput
                {...form.getInputProps("password")}
                key={form.key("password")}
                label="Password"
                placeholder="Password"
                required
              />
              <PasswordInput
                {...form.getInputProps("confirmPassword")}
                key={form.key("confirmPassword")}
                label="Confirm Password"
                placeholder="Confirm your password"
                required
              />
              <Group>
                <Checkbox />
                <Text size="sm">
                  Agree the <Anchor href="#">terms and policy</Anchor>.
                </Text>
              </Group>
              <Button fullWidth mt="md">
                Create new account
              </Button>
            </Stack>
          </form>
        </Paper>
        <Text ta="center" size="sm" mt="md">
          Already have an account? <Link to="/login">Sign in</Link>
        </Text>
      </Container>
    </BaseScreen>
  );
}
