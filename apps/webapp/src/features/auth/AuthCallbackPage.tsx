import { AppRoutes } from "@router/AppRoutes";
import { supabase } from "@core/auth/supabaseClient";
import { Button, Loader, Modal, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function AuthCallbackPage() {
  const navigation = useNavigate();
  // const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpened, setModalOpened] = useState(false);

  // TODO: Move this to an API file
  const getUser = (token: string) => {
    return fetch(`${import.meta.env.VITE_API_URL}/users`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  };

  const handleError = (message: string) => {
    setIsLoading(false);
    setError(message);
    setModalOpened(true);
  };

  const getUserSession = async () => {
    // We need to wait until Supabase sets the session properly
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session) {
      // Check if the user exists. If not, redirect to "register" page. If yes, just to dashboard
      try {
        const response = await getUser(session.access_token);
        setIsLoading(false);
        if (response.ok) {
          // Navigate to dashboard
          navigation(AppRoutes.DASHBOARD, {
            replace: true,
          });
        } else if (response.status == 404) {
          // Navigate to register user
          navigation(AppRoutes.Auth.REGISTER, {
            replace: true,
          });
        } else if (response.status == 403) {
          // User is not in the whitelist. So redirect to "Get an invitation" page
          navigation(AppRoutes.Auth.WAITING_LIST, {
            replace: true,
          });
        } else {
          handleError(`${response.status} : ${response.statusText}`);
        }
      } catch (error) {
        handleError("Error login user");
      }
    } else {
      navigation(AppRoutes.Auth.LOGIN, {
        replace: true,
      });
    }
  };

  useEffect(() => {
    getUserSession().catch((e) => {
      // Set error
      handleError(e.message);
    });
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Modal
        centered
        withCloseButton={false}
        opened={error !== ""}
        onClose={() => navigation(AppRoutes.Auth.LOGIN, { replace: true })}
        title="Error login the user"
      >
        <Stack>
          <Text>There is an error login the user. Please try again later.</Text>
          <Text>If the error persists, please contact support.</Text>
          <Text>Error details:</Text>
          <Text>{error}</Text>
          <Link to={AppRoutes.Auth.LOGIN} replace={true}>
            <Button>Login again</Button>
          </Link>
        </Stack>
      </Modal>
      <Modal
        centered
        withCloseButton={false}
        onClose={() => navigation(AppRoutes.Auth.LOGIN, { replace: true })}
        title="Error login the user"
        opened={modalOpened}
      >
        <>
          <Text>There is an error login the user. Please try again later.</Text>
          <Text>If the error persists, please contact support.</Text>
          <Text>Error details</Text>
          <div>{error.toString()}</div>
          <Link to={AppRoutes.Auth.LOGIN} replace={true}>
            <Button>Try again</Button>
          </Link>
        </>
      </Modal>
      <Loader />
    </>
  );
}
