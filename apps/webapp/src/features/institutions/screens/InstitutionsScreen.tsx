import { useGualletClient, useInstitutions } from "@guallet/api-react";
import InstitutionsTable from "../components/InstitutionsTable";
import { Stack, Button } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export function InstitutionsScreen() {
  const [isSyncingBanks, setIsSyncingBanks] = useState<boolean>(false);
  const client = useGualletClient();
  const { institutions } = useInstitutions();

  async function onSyncBanks() {
    try {
      setIsSyncingBanks(true);
      const response = await client.admin.syncOpenBankingInstitutions();
      console.log("Sync institutions response", response);
      if (response.status === 403) {
        // Handle forbidden error
        console.error("Forbidden: You do not have permission to sync banks.");
        notifications.show({
          title: "Error",
          message: "You need to be an admin to sync institutions",
          color: "red",
        });
        throw new Error("You need to be an admin to sync institutions");
      }
      if (!response.ok) {
        notifications.show({
          title: "Error",
          message: "Failed to sync banks",
          color: "red",
        });
        throw new Error("Failed to sync banks");
      } else {
        notifications.show({
          title: "Success",
          message: "Banks synced successfully",
          color: "green",
        });
      }

      // Handle success
    } catch (error) {
      console.error("Error syncing banks:", error);
      // Handle error
    } finally {
      setIsSyncingBanks(false);
    }
  }

  return (
    <Stack>
      <Button
        loading={isSyncingBanks}
        onClick={() => {
          onSyncBanks();
        }}
      >
        Sync Banks with Nordigen
      </Button>
      <InstitutionsTable institutions={institutions} />
    </Stack>
  );
}
