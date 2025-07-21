import { Currency } from "@guallet/money";
import { Box, Input, InputWrapperProps, Modal } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconSelector } from "@tabler/icons-react";
import { CurrencyPickerModal } from "./CurrencyPickerModal";

interface CurrencyPickerProps extends InputWrapperProps {
  value: string | null;
  onValueChanged: (value: string | null) => void;
  name: string | undefined;
}

export function CurrencyPicker({
  value,
  onValueChanged,
  name,
  ...props
}: Readonly<CurrencyPickerProps>) {
  const isMobile = useMediaQuery("(max-width: 50em)");
  const [opened, { open, close }] = useDisclosure(false);

  const currency = value ? Currency.fromISOCode(value) : null;

  return (
    <>
      <Modal
        opened={opened}
        fullScreen={isMobile}
        onClose={close}
        title="Select currency"
        centered
        size="lg"
        {...(isMobile && {
          transitionProps: { transition: "fade", duration: 200 },
        })}
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
          component="button"
          pointer
          onClick={open}
          rightSection={<IconSelector />}
        >
          {currency !== null ? (
            `${currency.symbol} - ${currency.name} - ${currency.code}`
          ) : (
            <Input.Placeholder>Select currency</Input.Placeholder>
          )}
        </Input>
      </Input.Wrapper>
    </>
  );
}
