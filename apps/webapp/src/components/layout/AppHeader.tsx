import { Burger } from "@mantine/core";

interface Props {
  isOpened: boolean;
  onToggle: () => void;
}

export default function AppHeader({ isOpened, onToggle }: Props) {
  return (
    <>
      <Burger opened={isOpened} onClick={onToggle} hiddenFrom="sm" size="sm" />
      <div>Logo</div>
    </>
  );
}
