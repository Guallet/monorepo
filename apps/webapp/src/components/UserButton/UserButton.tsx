import { UnstyledButton, Group } from "@mantine/core";
import classes from "./UserButton.module.css";

export function UserButton() {
  return (
    <UnstyledButton className={classes.user}>
      <Group></Group>
    </UnstyledButton>
  );
}
