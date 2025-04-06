import {
  Paper,
  Group,
  Divider,
  Stack,
  TextInput,
  Button,
  Text,
  PasswordInput,
  Container,
} from "@mantine/core";
import { useState } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm, zodResolver } from "@mantine/form";
import { GualletLogo } from "@/components/GualletLogo/GualletLogo";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { GoogleButton } from "../components/GoogleButton";
import { NavLinkButton } from "@/components/Buttons/NavLinkButton";

// Define a schema for form validation using Zod
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

interface LoginScreenProps {
  isLoading?: boolean;
  onGoogleLogin: () => void;
  onMagicLink: (email: string) => void;
  onPassword: (email: string, password: string) => void;
}

export function LoginScreen({
  isLoading,
  onGoogleLogin,
  onMagicLink,
  onPassword,
}: Readonly<LoginScreenProps>) {
  const { t } = useTranslation();
  const [loginType, setLoginType] = useState<"magic-link" | "password">(
    "magic-link"
  );

  const form = useForm<FormData>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: zodResolver(formSchema),
  });

  const onSubmitMagicLink = (data: FormData) => {
    onMagicLink(data.email);
  };

  const onSubmitPassword = (data: FormData) => {
    onPassword(data.email, data.password);
  };

  return (
    <BaseScreen isLoading={isLoading}>
      <Container
        size={420}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Stack justify="center" align="center">
          <GualletLogo size={50} />
          <Text ta="center" size="lg" w={500}>
            {t("screens.login.title.label", "CNF: Sign in to your account")}
          </Text>
        </Stack>

        <Paper withBorder shadow="md" p={30} mt={20} radius="md">
          <form onSubmit={form.onSubmit(() => {})}>
            <TextInput
              {...form.getInputProps("email")}
              label={t("screens.login.form.email.label", "CNF: Email")}
              type="email"
              placeholder={t(
                "screens.login.form.email.placeholder",
                "CNF: Enter your email"
              )}
              required
            />

            <PasswordInput
              {...form.getInputProps("password")}
              label={t("screens.login.form.password.label", "CNF: Password")}
              placeholder={t(
                "screens.login.form.password.placeholder",
                "CNF: Enter your password"
              )}
              required
              mt="md"
            />

            <Group justify="flex-end" mt="md">
              <NavLinkButton to="/login/forgot-password" size="sm">
                {t(
                  "screens.login.form.forgotPassword.label",
                  "CNF: Forgot password?"
                )}
              </NavLinkButton>
            </Group>

            <Button fullWidth mt="md" type="submit" color="blue">
              {t("screens.login.form.submitButton.label", "CNF: Sign in")}
            </Button>
          </form>

          <Divider
            label={t(
              "screens.login.form.divider.label",
              "CNF: Or continue with"
            )}
            labelPosition="center"
            my="lg"
          />

          <Group grow>
            <GoogleButton onClick={onGoogleLogin}>
              {t(
                "screens.login.form.googleLoginButton.label",
                "CNF: Continue with Google"
              )}
            </GoogleButton>
          </Group>
        </Paper>

        <Text ta="center" size="sm" mt="md">
          {t(
            "screens.login.createAccount.label",
            "CNF: Don't have an account?"
          )}{" "}
          <NavLinkButton to="/register">
            {t("screens.login.createAccount.cta", "CNF: Sign up!")}
          </NavLinkButton>
        </Text>
      </Container>
    </BaseScreen>
  );
}
