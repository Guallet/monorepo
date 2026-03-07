import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';

export function DataImporterHomeScreen() {
  const navigate = useNavigate();

  return (
    <BaseScreen>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Select your importer</p>
        <ImporterCard
          name="CSV Importer"
          description="Import your transactions from a CSV file"
          onClick={() => {
            navigate({ to: "/importer/csv" });
          }}
        />
      </div>
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        <Button className="w-full" onClick={onClick}>
        Import
        </Button>
      </CardContent>
    </Card>
  );
}
