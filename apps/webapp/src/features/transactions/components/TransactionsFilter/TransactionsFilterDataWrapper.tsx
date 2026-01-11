import { AccountDto, CategoryDto } from "@guallet/api-client";
import { TransactionsFilter } from "./TransactionsFilter";
import { FilterData } from "./FilterData";
import { useAccounts, useCategories } from "@guallet/api-react";
import { ActionIcon, Card, Group, Indicator, Modal, Stack, Text } from "@mantine/core";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDisclosure } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";

interface TransactionsFilterDataWrapperProps {
  selectedAccounts: AccountDto[] | string[] | null;
  selectedCategories: CategoryDto[] | string[] | null;
  dateRange: { startDate: Date; endDate: Date } | null;
  onFiltersUpdate: (filters: FilterData) => void;
}

export function TransactionsFilterDataWrapper({
  selectedAccounts,
  selectedCategories,
  dateRange,
  onFiltersUpdate,
}: Readonly<TransactionsFilterDataWrapperProps>) {
  const isMobile = useIsMobile();
  const [opened, { open, close }] = useDisclosure(false);
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const mappedSelectedAccounts = (selectedAccounts ?? accounts)
    .map((account) =>
      typeof account === "string"
        ? accounts.find((a) => a.id === account)
        : account
    )
    .filter((account): account is AccountDto => account !== undefined);

  const mappedSelectedCategories = (selectedCategories ?? categories)
    .map((category) =>
      typeof category === "string"
        ? categories.find((c) => c.id === category)
        : category
    )
    .filter((category): category is CategoryDto => category !== undefined);

  const handleFiltersUpdate = (newFilters: FilterData) => {
    const finalFilters = { ...newFilters };

    // Because all the accounts are selected, just return null or undefined
    if (newFilters.selectedAccounts?.length === accounts.length) {
      finalFilters.selectedAccounts = undefined;
    }
    // Because all the categories are selected, just return null or undefined
    if (newFilters.selectedCategories?.length === categories.length) {
      finalFilters.selectedCategories = undefined;
    }
    onFiltersUpdate(finalFilters);
  };

  const filters = {
    selectedAccounts: mappedSelectedAccounts,
    selectedCategories: mappedSelectedCategories,
    dateRange: dateRange,
  };

  // Count active filters
  const activeFiltersCount = [
    mappedSelectedAccounts.length > 0 && mappedSelectedAccounts.length < accounts.length,
    mappedSelectedCategories.length > 0 && mappedSelectedCategories.length < categories.length,
    dateRange !== null,
  ].filter(Boolean).length;

  // Mobile view: Show filter icon with badge
  if (isMobile) {
    return (
      <>
        <Card withBorder radius="md" p="sm">
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" fw={500}>
              Filters
            </Text>
            <Indicator
              label={activeFiltersCount > 0 ? activeFiltersCount : undefined}
              disabled={activeFiltersCount === 0}
              inline
              size={18}
            >
              <ActionIcon
                variant="light"
                size="lg"
                onClick={open}
                aria-label="Open filters"
              >
                <IconFilter size={20} />
              </ActionIcon>
            </Indicator>
          </Group>
        </Card>
        <Modal
          opened={opened}
          onClose={close}
          title={<Text fw={600}>Filter Transactions</Text>}
          fullScreen={true}
          transitionProps={{ transition: "slide-up", duration: 200 }}
        >
          <Stack gap="md">
            <TransactionsFilter
              filters={filters}
              onFiltersUpdate={(newFilters: FilterData) => {
                handleFiltersUpdate(newFilters);
              }}
            />
          </Stack>
        </Modal>
      </>
    );
  }

  // Desktop view: Show filters inline
  return (
    <TransactionsFilter
      filters={filters}
      onFiltersUpdate={handleFiltersUpdate}
    />
  );
}
