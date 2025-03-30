import {
  Center,
  Paper,
  Group,
  Divider,
  Stack,
  Anchor,
  TextInput,
  Button,
  Text,
  PasswordInput,
  Checkbox,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { useState } from "react";
import { GoogleButton } from "../components/GoogleButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define a schema for form validation using Zod
const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  terms: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof schema>;

interface LoginScreenProps {
  onGoogleLogin: () => void;
  onMagicLink: (email: string) => void;
  onPassword: (email: string, password: string) => void;
}

export function LoginScreen({
  onGoogleLogin,
  onMagicLink,
  onPassword,
}: LoginScreenProps) {
  const [loginType, setLoginType] = useState<"magic-link" | "password">(
    "magic-link"
  );

  // Initialize react-hook-form with Zod resolver
  const form = useForm<FormData>({
    resolver: zodResolver<FormData>(schema),
    defaultValues: {
      email: "",
      password: "",
      terms: false,
    },
  });

  const onSubmitMagicLink = (data: FormData) => {
    onMagicLink(data.email);
  };

  const onSubmitPassword = (data: FormData) => {
    onPassword(data.email, data.password);
  };

  return (
    <Center>
      <Paper
        radius="md"
        p="xl"
        withBorder
        style={{
          margin: "1.5rem",
        }}
      >
        <Text size="lg" fw={500}>
          Welcome to Guallet, continue with
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleButton
            radius="xl"
            onClick={() => {
              onGoogleLogin();
            }}
          >
            Google
          </GoogleButton>
        </Group>

        <Divider
          label="Or continue with email"
          labelPosition="center"
          my="lg"
        />

        <form
          onSubmit={
            loginType === "magic-link"
              ? form.handleSubmit(onSubmitMagicLink)
              : form.handleSubmit(onSubmitPassword)
          }
        >
          <Stack>
            {loginType === "magic-link" ? (
              <Anchor
                onClick={() => setLoginType("password")}
                style={{ textAlign: "center" }}
              >
                Login with password
              </Anchor>
            ) : (
              <Anchor
                onClick={() => setLoginType("magic-link")}
                style={{ textAlign: "center" }}
              >
                Login with magic link
              </Anchor>
            )}

            <TextInput
              required
              label="Email"
              placeholder="Enter your email here"
              {...form.register("email")}
              error={form.formState.errors.email?.message}
              radius="md"
            />

            {loginType === "magic-link" ? (
              <Stack>
                <Button type="submit" radius="xl">
                  {upperFirst("Send magic link")}
                </Button>
              </Stack>
            ) : (
              <Stack>
                <PasswordInput
                  required
                  label="Password"
                  placeholder="Your password"
                  {...form.register("password")}
                  error={form.formState.errors.password?.message}
                  radius="md"
                />
                <Button type="submit" radius="xl">
                  {upperFirst("Login with password")}
                </Button>
              </Stack>
            )}

            <Checkbox
              label="I accept the terms and conditions"
              {...form.register("terms")}
              error={form.formState.errors.terms?.message}
            />
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
