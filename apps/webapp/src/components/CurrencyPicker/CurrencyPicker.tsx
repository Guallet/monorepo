import { Currency, ISO4217Currencies } from "@guallet/money";
import { SearchBoxInput } from "@guallet/ui-react";
import {
  Button,
  Grid,
  Group,
  Input,
  InputWrapperProps,
  Modal,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconSelector } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import classes from "./CurrencyPicker.module.css";

interface CurrencyPickerProps extends InputWrapperProps {
  value: string;
  onValueChanged: (value: string) => void;
  name: string | undefined;
}

export function CurrencyPicker({
  value,
  onValueChanged,
  name,
  ...props
}: CurrencyPickerProps) {
  const isMobile = useMediaQuery("(max-width: 50em)");
  const [opened, { open, close }] = useDisclosure(false);

  const currency = Currency.fromISOCode(value);

  return (
    <>
      <Modal
        opened={opened}
        fullScreen={isMobile}
        onClose={close}
        title="Select currency"
      >
        <CurrencyPickerModal
          onCurrencySelected={(currency) => {
            onValueChanged?.(currency.code);
            close();
          }}
          onCancel={() => close()}
        />
      </Modal>

      <Input.Wrapper
        label="Account currency"
        description="The currency of the account"
        {...props}
      >
        <Input
          name={name}
          placeholder="Select currency"
          component="button"
          pointer
          onClick={open}
          rightSection={<IconSelector />}
        >
          {currency.symbol} - {currency.name} - {currency.code}
        </Input>
      </Input.Wrapper>
    </>
  );
}

const currencyCodes = Object.values(ISO4217Currencies)
  .sort()
  // Remove Antarctica
  .map((currency) => {
    return Currency.fromISOCode(currency.code);
  });

interface CurrencyPickerModalProps {
  onCurrencySelected: (currency: Currency) => void;
  onCancel: () => void;
}
function CurrencyPickerModal({
  onCurrencySelected,
  onCancel,
}: CurrencyPickerModalProps) {
  const [query, setQuery] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] =
    useState<Currency[]>(currencyCodes);

  useEffect(() => {
    if (query === "" || query === null || query === undefined) {
      setFilteredCurrencies(currencyCodes);
    } else {
      const filtered = currencyCodes.filter((currency) => {
        return (
          currency.name.toLowerCase().includes(query.toLowerCase()) ||
          currency.symbol.toLowerCase().includes(query.toLowerCase()) ||
          currency.code.toLowerCase().includes(query.toLowerCase())
        );
      });
      setFilteredCurrencies(filtered);
    }
  }, [query]);

  return (
    <Stack>
      <SearchBoxInput
        query={query}
        onSearchQueryChanged={(newQuery) => {
          setQuery(newQuery);
        }}
      />
      <ScrollArea.Autosize mah={300}>
        {filteredCurrencies.length === 0 && <Text>No currencies found</Text>}
        {filteredCurrencies.map((currency) => (
          <Group grow key={currency.code}>
            <UnstyledButton
              className={classes.baseButton}
              onClick={() => {
                onCurrencySelected(currency);
              }}
            >
              <Grid>
                <Grid.Col span={2}>
                  <Text>{currency.symbol}</Text>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Text>{currency.code}</Text>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text truncate="end">{currency.name}</Text>
                </Grid.Col>
              </Grid>
            </UnstyledButton>
          </Group>
        ))}
      </ScrollArea.Autosize>
      <Group justify="end">
        <Button onClick={() => onCancel()}>Cancel</Button>
      </Group>
    </Stack>
  );
}
