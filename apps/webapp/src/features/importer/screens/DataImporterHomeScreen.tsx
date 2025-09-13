import { BaseScreen } from "@/components/Screens/BaseScreen";
import { Button, Card, Stack, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

export function DataImporterHomeScreen() {
  const navigate = useNavigate();
  return (
    <BaseScreen>
      <Stack>
        <Text>Select your importer</Text>
        <ImporterCard
          name="CSV Importer"
          description="Import your transactions from a CSV file"
          onClick={() => {
            navigate({ to: "/importer/csv" });
          }}
        />
      </Stack>
    </BaseScreen>
  );
}

interface ImporterCardProps {
  name: string;
  description?: string;
  onClick: () => void;
}
function ImporterCard({
  name,
  description,
  onClick,
}: Readonly<ImporterCardProps>) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={500}>{name}</Text>
      {description && <Text>{description}</Text>}
      <Button color="blue" fullWidth mt="md" radius="md" onClick={onClick}>
        Import
      </Button>
    </Card>
  );
}
