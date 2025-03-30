import { Center, Paper, Stack, Text, TextInput, Button } from "@mantine/core";
import { useState } from "react";

interface ValidateOtpScreenProps {
  email: string;
  onValidateOtp: (code: string) => void;
}

export function ValidateOtpScreen({
  email,
  onValidateOtp,
}: ValidateOtpScreenProps) {
  const [code, setCode] = useState<string>("");

  return (
    <Center>
      <Paper
        radius="md"
        p="xl"
        withBorder
        style={{
          margin: "1.5rem",
        }}
      >
        <Stack>
          <Text>Enter the code sent to {email}</Text>
          <TextInput
            placeholder="Enter the 6 digit code"
            value={code}
            onChange={(event) => {
              setCode(event.currentTarget.value);
            }}
          />
          <Button
            onClick={() => {
              onValidateOtp(code);
            }}
          >
            Validate Code
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
