import { Button, Center, Paper, Stack, Text, TextInput } from "@mantine/core";
import { useState } from "react";

interface ValidateOtpProps {
  email: string;
  onValidateOtp: (code: string) => void;
  onGoBack: () => void;
}
export function ValidateOtp({
  email,
  onValidateOtp,
  onGoBack,
}: ValidateOtpProps) {
  const [code, setCode] = useState("");

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
