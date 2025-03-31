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
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm, zodResolver } from "@mantine/form";

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
  const { t } = useTranslation();
  const [loginType, setLoginType] = useState<"magic-link" | "password">(
    "magic-link"
  );

  const form = useForm<FormData>({
    mode: "uncontrolled",
    validate: zodResolver(schema),
    initialValues: {
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
          {t("screens.login.title")}
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
          label={t("screens.login.form.continueWithDivider")}
          labelPosition="center"
          my="lg"
        />

        <form
          onSubmit={
            loginType === "magic-link"
              ? form.onSubmit(onSubmitMagicLink)
              : form.onSubmit(onSubmitPassword)
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
              key={form.key("email")}
              {...form.getInputProps("email")}
              required
              label="Email"
              placeholder="Enter your email here"
              // error={form.errors.errors.email?.message}
              error={form.errors.email}
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
                  key={form.key("password")}
                  {...form.getInputProps("password")}
                  required
                  label="Password"
                  placeholder="Your password"
                  error={form.errors.password}
                  radius="md"
                />
                <Button type="submit" radius="xl">
                  {upperFirst("Login with password")}
                </Button>
              </Stack>
            )}

            <Checkbox
              key={form.key("terms")}
              {...form.getInputProps("terms")}
              label="I accept the terms and conditions"
              error={form.errors.terms}
            />
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
