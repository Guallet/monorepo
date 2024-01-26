import { Burger, Group, Image, Title, UnstyledButton } from "@mantine/core";
import logo from "@/assets/guallet.svg";

interface Props {
  isOpened: boolean;
  onToggle: () => void;
}

export default function AppHeader({ isOpened, onToggle }: Props) {
  return (
    <Group>
      <Burger opened={isOpened} onClick={onToggle} hiddenFrom="sm" size="sm" />
      <UnstyledButton
        component="a"
        variant="transparent"
        href={"/"}
        onClick={(event) => event.preventDefault()}
      >
        <Group>
          <Image
            src={logo}
            radius="md"
            h={40}
            w="auto"
            fit="fill"
            alt="Guallet logo"
          />
          <Title order={2}>Guallet</Title>
        </Group>
      </UnstyledButton>
    </Group>
  );
}
