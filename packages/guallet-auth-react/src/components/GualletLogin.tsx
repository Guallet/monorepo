import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Text,
  Center,
} from "@mantine/core";
import { useToggle, upperFirst } from "@mantine/hooks";
import { GoogleButton } from "./SocialButtons/GoogleButton";
import { useForm } from "@mantine/form";
import { useState } from "react";

interface GualletLoginProps {
  onGoogleLogin: () => void;
  onMagicLink: (email: string) => void;
  onPassword: (email: string, password: string) => void;
}
export function GualletLogin({
  onGoogleLogin,
  onMagicLink,
  onPassword,
}: GualletLoginProps) {
  const [loginType, setLoginType] = useState<"magic-link" | "password">(
    "magic-link"
  );

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

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

        <form onSubmit={form.onSubmit(() => {})}>
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
              value={form.values.email}
              onChange={(event) =>
                form.setFieldValue("email", event.currentTarget.value)
              }
              error={form.errors.email && "Invalid email"}
              radius="md"
            />

            {loginType === "magic-link" ? (
              <Stack>
                <Button
                  type="submit"
                  radius="xl"
                  onClick={() => {
                    onMagicLink(form.values.email);
                  }}
                >
                  {upperFirst("Send magic link")}
                </Button>
              </Stack>
            ) : (
              <Stack>
                <PasswordInput
                  required
                  label="Password"
                  placeholder="Your password"
                  value={form.values.password}
                  onChange={(event) =>
                    form.setFieldValue("password", event.currentTarget.value)
                  }
                  error={
                    form.errors.password &&
                    "Password should include at least 6 characters"
                  }
                  radius="md"
                />
                <Button
                  type="submit"
                  radius="xl"
                  onClick={() => {
                    onPassword(form.values.email, form.values.password);
                  }}
                >
                  {upperFirst("Login with password")}
                </Button>
              </Stack>
            )}

            <Checkbox
              label="I accept the terms and conditions"
              checked={form.values.terms}
              onChange={(event) =>
                form.setFieldValue("terms", event.currentTarget.checked)
              }
            />
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
