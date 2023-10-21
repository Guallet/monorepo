import { UnstyledButton, Group, Avatar, Text, rem } from "@mantine/core";
import classes from "./BaseButton.module.css";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick: () => void;
}

export function BaseButton({ children, onClick }: Props) {
  return (
    <UnstyledButton
      className={classes.baseButton}
      onClick={onClick}
      disabled={onClick == null}
    >
      {children}
    </UnstyledButton>
  );
}
