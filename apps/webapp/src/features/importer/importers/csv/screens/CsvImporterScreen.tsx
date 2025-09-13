import { useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useState } from "react";
import { csvInfoAtom } from "../state/csvState";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { CSV_MIME_TYPE } from "../models";
import { Group, rem, Text } from "@mantine/core";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import Papa from "papaparse";

export function CsvImporterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useAtom(csvInfoAtom);
  const navigate = useNavigate();

  async function readFile(file: FileWithPath) {
    try {
      setIsLoading(true);
      const fileContent = await file.text();
      const { data, errors, meta } = Papa.parse(fileContent, {
        header: true,
      });
      setCsvData({
        data: data,
        properties: meta.fields ?? [],
      });

      navigate({
        to: "/importer/csv/properties",
      });
    } catch (e) {
      console.error("It's not possible to read the file", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dropzone
      onDrop={(files) => {
        readFile(files[0]);
      }}
      onReject={(files) => console.log("rejected files", files)}
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
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag CSV file here or click to select file
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            The file needs to be a valid CSV file
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
