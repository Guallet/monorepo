import { View, Text } from "react-native";
import * as Linking from "expo-linking";
import { Stack, router, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Icon,
  PrimaryButton,
  SecondaryButton,
  Spacing,
} from "@guallet/ui-react-native";
import { useRoute } from "@react-navigation/native";

// async function linkAccounts() {
//   // For each account, call the API to create the connection
//   const response = await linkObAccounts(
//     accounts.map((a) => a.id).filter((a) => a !== null) as string[]
//   );
//   console.log(response);
// }

const pageSearchSchema = z.object({
  ref: z.string().nullable(),
  error: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
});

export default function ConnectCallbackScreen() {
  const url = Linking.useURL();
  const { path } = useRoute();

  const [ref, setRef] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log("CALLBACK URL", url);
    setError(false);
    setErrorMessage(null);

    if (url) {
      const { queryParams } = Linking.parse(url);

      if (queryParams) {
        const params = pageSearchSchema.parse({
          ref: queryParams["ref"],
          error: queryParams["error"],
          details: queryParams["details"],
        });

        setRef(params.ref ?? null);
        setDetails(params.details ?? null);
        setErrorMessage(params.error ?? null);

        // If no error, then link the accounts
        if (params.error) {
          setError(true);
          setErrorMessage(params.details ?? "Unknown error");
        } else {
          // Connect the accounts to the user
          // setIsLoading(true);
          // linkAccounts()
          //   .then(() => {})
          //   .catch((error) => {
          //     console.error(error);
          //     notifications.show({
          //       message: "Error",
          //       description: "An error occurred while linking the accounts",
          //       type: "error",
          //     });
          //   });
        }
      } else {
        setError(true);
        console.log("INVALID PARAMS");
        setErrorMessage("Invalid query params in URL");
      }
    } else {
      console.log("EMPTY URL");
      setError(true);
      setErrorMessage("Invalid callback URL");
    }
  }, [url, path]);

  if (error) {
    return (
      <View
        style={{
          padding: Spacing.medium,
          flex: 1,
          flexDirection: "column",
        }}
      >
        <Stack.Screen
          options={{
            title: "Error",
            headerTitleAlign: "center",
            headerBackVisible: false,
            headerRight: () => {
              return (
                <Icon
                  name="xmark"
                  size={24}
                  onPress={() => router.replace("/(app)/accounts")}
                />
              );
            },
          }}
        />
        <Text>Error connecting to bank</Text>
        <Text>{errorMessage}</Text>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <SecondaryButton
            style={{
              marginBottom: Spacing.small,
            }}
            title="Report Error"
            onPress={() => {}}
          />
          <PrimaryButton
            title="Go back"
            onPress={() => {
              router.replace("/(app)/accounts");
            }}
          />
        </View>
      </View>
    );
  } else {
    return (
      <View>
        <Stack.Screen
          options={{
            title: "Account connected",
            headerTitleAlign: "center",
            headerBackVisible: false,
          }}
        />
        <Text>This is the callback page from open banking</Text>
        <Text>Reference: {ref}</Text>
        <Text>Details: {details}</Text>
        <Text>Error: {error}</Text>
      </View>
    );
  }
}
