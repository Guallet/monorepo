import { Currency, ISO4217Currencies } from "@guallet/money";
import { SearchBoxInput } from "@guallet/ui-react";
import {
  ScrollArea,
  Group,
  UnstyledButton,
  Grid,
  Button,
  Text,
  Flex,
  Box,
} from "@mantine/core";
import { useState, useEffect } from "react";
import classes from "./CurrencyPicker.module.css";

const currencyCodes = Object.values(ISO4217Currencies)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((currency) => {
    return Currency.fromISOCode(currency.code);
  });

interface CurrencyPickerModalProps {
  onCurrencySelected: (currency: Currency) => void;
  onCancel: () => void;
}

export function CurrencyPickerModal({
  onCurrencySelected,
  onCancel,
}: Readonly<CurrencyPickerModalProps>) {
  const [query, setQuery] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] =
    useState<Currency[]>(currencyCodes);

  useEffect(() => {
    if (query === "" || query === null || query === undefined) {
      setFilteredCurrencies(currencyCodes);
    } else {
      const filtered = currencyCodes.filter((currency) =>
        JSON.stringify(currency).toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCurrencies(filtered);
    }
  }, [query]);

  //   return (
  //     <Flex
  //       align="stretch"
  //       justify="center"
  //       direction="column"
  //       gap={"md"}
  //       style={{ background: "pink", height: "100%" }}
  //     >
  //       <Box h={50} style={{ background: "red" }} />
  //       <Box h={50} style={{ flexGrow: 1, background: "green" }} />
  //       <Box h={50} style={{ background: "yellow" }} />
  //     </Flex>
  //   );

  return (
    <Flex
      align="stretch"
      justify="center"
      direction="column"
      gap={"md"}
      style={{ height: "100%" }}
    >
      <SearchBoxInput
        query={query}
        onSearchQueryChanged={(newQuery) => {
          setQuery(newQuery);
        }}
      />
      <ScrollArea
        type="scroll"
        scrollbars="y"
        style={{ flex: 1, minHeight: 0 }}
      >
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
      </ScrollArea>
      <Group justify="end">
        <Button onClick={() => onCancel()}>Cancel</Button>
      </Group>
    </Flex>
  );
}
