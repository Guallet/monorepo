import {
  Column,
  Label,
  PrimaryButton,
  Spacing,
} from "@guallet/ui-react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppScreen } from "@/components/layout/AppScreen";

export default function Auth() {
  const insets = useSafeAreaInsets();

  return (
    <AppScreen
      headerOptions={{ headerShown: false }}
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: Spacing.medium,
      }}
    >
      <Column
        style={{
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <Column>
          <Label style={{ alignSelf: "center" }}>Guallet</Label>
          {/* TODO: This could be a pager view with multiple content */}
          {/* <Image
            source={require("@/assets/images/illustrations/login_welcome.svg")}
            style={{
              width: "auto",
              height: 200,
              marginTop: Spacing.extraLarge,
            }}
            contentFit="contain"
            contentPosition="center"
          /> */}
          <Label style={{ alignSelf: "center" }} variant="title">
            See all your money in one place
          </Label>
          <Label>
            Connect your accounts, and track where your money is going
          </Label>
        </Column>

        <Column style={{ marginVertical: Spacing.large }}>
          <PrimaryButton
            title={"Sign in to continue"}
            onClick={() => {
              router.navigate("/login/signin");
            }}
          />
        </Column>
      </Column>
    </AppScreen>
  );
}
