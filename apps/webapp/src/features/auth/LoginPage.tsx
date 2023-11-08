import {
  Text,
  Paper,
  Group,
  Center,
  Divider,
  Stack,
  TextInput,
  Button,
  Container,
  Modal,
} from "@mantine/core";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Provider } from "@supabase/supabase-js";
import { useForm } from "@mantine/form";
import { supabase } from "../../core/auth/supabaseClient";
import { useAuth } from "../../core/auth/useAuth";
import { GoogleButton } from "../../components/SocialButtons/GoogleButton";

const EMAIL_MODAL_OPEN_QUERY = "email_sent";

export function LoginPage() {
  const navigation = useNavigate();
  const location = useLocation();
  const { session, loading } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const isModalOpen = searchParams.get(EMAIL_MODAL_OPEN_QUERY) === "true";

  const locationState = location.state as { from: { pathname: string } };
  const navigationOrigin = locationState?.from?.pathname || "/dashboard";

  async function socialLogin(provider: Provider) {
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/login/callback`,
      },
    });
  }

  const form = useForm({
    initialValues: {
      email: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
    },
  });

  function showModal() {
    setSearchParams((params) => {
      params.append(EMAIL_MODAL_OPEN_QUERY, "true");
      return params;
    });
  }

  function hideModal() {
    setSearchParams((params) => {
      params.delete(EMAIL_MODAL_OPEN_QUERY);
      return params;
    });
    form.reset();
  }

  async function sendMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({
      email: form.values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/login/callback`,
      },
    });

    showModal();
  }

  useEffect(() => {
    if (session !== null && loading === false) {
      navigation(navigationOrigin, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loading]);

  return (
    <>
      <Modal
        centered
        opened={isModalOpen}
        overlayProps={{ opacity: 0.55, blur: 3 }}
        onClose={() => hideModal()}
        title="Check your email"
      >
        {/* Modal content */}
        <Stack>
          <Text>We have sent you a email to login into Guallet</Text>
          <Text>Please follow the instructions in the email to login</Text>
          <Button
            onClick={() => {
              hideModal();
            }}
          >
            I will check my email!
          </Button>
        </Stack>
      </Modal>

      <Container>
        <Center>
          <Paper radius="md" p="xl" withBorder>
            <Text size="lg" fw={500}>
              Welcome to Guallet, login with
            </Text>

            <Group grow mb="md" mt="md">
              <GoogleButton
                radius="xl"
                onClick={() => {
                  socialLogin("google");
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
              onSubmit={form.onSubmit(() => {
                sendMagicLink();
              })}
            >
              <Stack>
                <TextInput
                  required
                  label="Email"
                  placeholder="Enter your email"
                  value={form.values.email}
                  onChange={(event) =>
                    form.setFieldValue("email", event.currentTarget.value)
                  }
                  error={form.errors.email && "Invalid email"}
                />
                <Button type="submit">Send magic link</Button>
              </Stack>
            </form>
          </Paper>
        </Center>
      </Container>
    </>
  );
}
