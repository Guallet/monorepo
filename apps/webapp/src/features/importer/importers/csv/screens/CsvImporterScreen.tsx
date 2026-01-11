import { useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useState } from "react";
import { csvInfoAtom } from "../state/csvState";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { CSV_MIME_TYPE } from "../models";
import { 
  Container, 
  Group, 
  rem, 
  Text, 
  Title, 
  Stack,
  Paper,
  List,
  ThemeIcon,
  Alert
} from "@mantine/core";
import { 
  IconFileTypeCsv, 
  IconUpload, 
  IconX, 
  IconCheck,
  IconInfoCircle
} from "@tabler/icons-react";
import Papa from "papaparse";

export function CsvImporterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvData, setCsvData] = useAtom(csvInfoAtom);
  const navigate = useNavigate();

  async function readFile(file: FileWithPath) {
    try {
      setIsLoading(true);
      setError(null);
      const fileContent = await file.text();
      const { data, errors, meta } = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      
      if (errors.length > 0) {
        setError(`CSV parsing errors: ${errors[0].message}`);
        return;
      }
      
      if (!meta.fields || meta.fields.length === 0) {
        setError("CSV file appears to be empty or has no headers");
        return;
      }

      setCsvData({
        data: data,
        properties: meta.fields ?? [],
      });

      navigate({
        to: "/importer/csv/properties",
      });
    } catch (e) {
      console.error("It's not possible to read the file", e);
      setError("Failed to read the CSV file. Please ensure it's a valid CSV format.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={2}>Import CSV File</Title>
          <Text c="dimmed" size="sm">
            Upload your transaction data in CSV format. We'll help you map the fields
            and import everything automatically.
          </Text>
        </Stack>

        {error && (
          <Alert 
            icon={<IconInfoCircle size={16} />} 
            title="Error" 
            color="red" 
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Paper shadow="xs" p="xl" withBorder>
          <Dropzone
            onDrop={(files) => {
              readFile(files[0]);
            }}
            onReject={(files) => {
              const rejection = files[0];
              if (rejection.errors[0]?.code === 'file-too-large') {
                setError('File is too large. Maximum size is 5MB.');
              } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                setError('Invalid file type. Please upload a CSV file.');
              }
            }}
            maxSize={5 * 1024 ** 2}
            accept={[CSV_MIME_TYPE]}
            maxFiles={1}
            multiple={false}
            loading={isLoading}
          >
            <Group
              justify="center"
              gap="xl"
              mih={220}
              style={{ pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconUpload
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-blue-6)",
                  }}
                  stroke={1.5}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-red-6)",
                  }}
                  stroke={1.5}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconFileTypeCsv
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-dimmed)",
                  }}
                  stroke={1.5}
                />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline fw={500}>
                  Drag CSV file here or click to select
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  File should not exceed 5MB
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text fw={500} size="sm">CSV Requirements:</Text>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="teal" size={20} radius="xl">
                  <IconCheck style={{ width: rem(12), height: rem(12) }} />
                </ThemeIcon>
              }
            >
              <List.Item>First row should contain column headers</List.Item>
              <List.Item>Must include date and amount columns</List.Item>
              <List.Item>Supported formats: .csv files only</List.Item>
              <List.Item>Maximum file size: 5MB</List.Item>
            </List>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
