import { Button, Loader, Modal, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../core/auth/supabaseClient";

export function AuthCallbackPage() {
  const navigation = useNavigate();
  // const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpened, setModalOpened] = useState(false);

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
      // Navigate to dashboard
      navigation("/dashboard", {
        replace: true,
      });

      // TODO: Restore the logic below to create the user the first time it logs in into the app
      //   // Check if the user exists. If not, redirect to "register" page. If yes, just to dashboard
      //   try {
      //     const response = await getUser(session.access_token);
      //     setIsLoading(false);
      //     if (response.ok) {
      //       // Navigate to dashboard
      //       navigation('/dashboard', {
      //         replace: true,
      //       });
      //     } else if (response.status == 404) {
      //       // Navigate to register user
      //       navigation('/user/register', {
      //         replace: true,
      //       });
      //     } else {
      //       handleError(`${response.status} : ${response.statusText}`);
      //     }
      //   } catch (error) {
      //     console.error('Error login user', error);
      //     handleError('Error login user');
      //   }
    } else {
      navigation("/login", {
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
  } else {
    return "not loading";
  }

  return (
    <>
      {/* <Modal
                centered
                withCloseButton={false}
                opened={error !== ''}
                onClose={() => navigation("/login", { replace: true })}
                title="Error login the user"
            >
                <div>
                    <Text>There is an error login the user. Please try again later.</Text>
                    <Text>If the error persists, please contact support.</Text>
                    <Text>Error details:</Text>
                    <Text>{error}</Text>
                    <Link to={'/login'} replace={true}>
                        <Button>Login again</Button>
                    </Link>
                </div>
            </Modal> */}
      <Modal
        centered
        withCloseButton={false}
        onClose={() => navigation("/login", { replace: true })}
        title="Error login the user"
        opened={modalOpened}
      >
        <>
          <Text>There is an error login the user. Please try again later.</Text>
          <Text>If the error persists, please contact support.</Text>
          <Text>Error details</Text>
          <div>{error.toString()}</div>
          <Link to={"/login"} replace={true}>
            <Button>Try again</Button>
          </Link>
        </>
      </Modal>
      <Loader />
    </>
  );
}
