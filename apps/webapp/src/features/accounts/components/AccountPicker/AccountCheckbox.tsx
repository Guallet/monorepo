import { Checkbox, Text, UnstyledButton, Group } from "@mantine/core";
import classes from "./AccountCheckbox.module.css";
import { useRef } from "react";
import { AccountDto } from "@guallet/api-client";
import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";

interface AccountCheckboxProps {
  account: AccountDto;
}

// NOTE: This component is meant to be used in within a Controlled
// https://mantine.dev/core/checkbox/#controlled-checkboxgroup
// If that is not the case, the component will not work as expected and you will need to find an
// alternative way to handle the checkbox state
export function AccountCheckbox({
  account,
  ...others
}: AccountCheckboxProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof AccountCheckboxProps>) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <UnstyledButton
      onClick={() => {
        if (ref.current) {
          ref.current.click();
        }
      }}
      className={classes.button}
      {...others}
    >
      <Group wrap="nowrap">
        <Checkbox
          value={account.id}
          ref={ref}
          tabIndex={-1}
          styles={{
            input: { cursor: "pointer" },
          }}
        />

        <AccountAvatar
          accountId={account.id}
          // size={40}
          style={{
            marginLeft: 10,
          }}
        />

        <div className={classes.body}>
          <Text
            fw={500}
            size="sm"
            lh={1}
            lineClamp={1}
            truncate="end"
            style={{
              flexGrow: 1,
              overflow: "hidden",
            }}
          >
            {account.name}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}
