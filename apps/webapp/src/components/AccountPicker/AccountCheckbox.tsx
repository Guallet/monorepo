import {
  Account,
  getAccountTypeTitle,
} from "@/features/accounts/models/Account";
import { Checkbox, Text, UnstyledButton, Avatar } from "@mantine/core";
import classes from "./AccountCheckbox.module.css";
import { useRef } from "react";

interface AccountCheckboxProps {
  account: Account;
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
      <Checkbox
        value={account.id}
        ref={ref}
        tabIndex={-1}
        styles={{
          input: { cursor: "pointer" },
        }}
      />

      <Avatar
        src={account.institution?.image_src}
        defaultValue={account.name}
        alt={account.institution?.name ?? account.name}
        // size={40}
        style={{
          marginLeft: 10,
        }}
      />

      <div className={classes.body}>
        <Text fw={500} size="sm" lh={1}>
          {account.name}
        </Text>
        <Text c="dimmed" size="xs" lh={1} mb={5}>
          {getAccountTypeTitle(account.type)}
        </Text>
      </div>
    </UnstyledButton>
  );
}
