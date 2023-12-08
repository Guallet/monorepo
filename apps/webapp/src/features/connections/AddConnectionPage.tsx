import {
  Avatar,
  Button,
  ComboboxItem,
  Group,
  OptionsFilter,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import {
  CountryDto,
  InstitutionDto,
  createConnection,
  getInstitutions,
  getSupportedCountries,
} from "./api/connections.api";
import { ListView, SearchableListView } from "@guallet/ui-react";
import { useState } from "react";

interface LoaderData {
  countries: CountryDto[];
  selectedCountry: string | null;
  banks: InstitutionDto[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const selectedCountry = url.searchParams.get("country");

  const countries = await getSupportedCountries();

  let banks: InstitutionDto[] = [];

  if (selectedCountry) {
    banks = await getInstitutions(selectedCountry);
  }

  return {
    countries: countries,
    selectedCountry: selectedCountry,
    banks: banks,
  } as LoaderData;
};

export function AddConnectionPage() {
  const navigate = useNavigate();

  const { countries, selectedCountry, banks } = useLoaderData() as LoaderData;

  const [selectedBank, setSelectedBank] = useState<InstitutionDto | null>(null);
  const [canContinue, setCanContinue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function selectedCountryChange(value: string | null) {
    if (!value) {
      return;
    } else {
      const country = countries.find((country) => country.name === value);

      if (country) {
        // TODO: Use the query params rather than full navigation
        navigate(`/connections/connect?country=${country?.code}`);
      } else {
        console.error("Country not found", value);
      }
    }
  }

  async function onCreateConnection(institution: InstitutionDto) {
    // Create the requisition request and navigate to the link returned by the request
    console.log("Creating connection to", institution);

    setIsLoading(true);
    try {
      const response = await createConnection(institution.id);
      console.log("Response", response);
      response.link && window.open(response.link, "_self");
      // if (response.link) {
      //   window.location.href = response.link;
      // }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }

  return (
    <Stack>
      <Title>Connect to a bank</Title>
      <Select
        label="Select a country"
        placeholder="Pick a country"
        data={countries.map((country) => country.name)}
        filter={optionsFilter}
        searchable
        nothingFoundMessage="No countries found"
        checkIconPosition="right"
        allowDeselect={false}
        withScrollArea={false}
        styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
        mt="md"
        onChange={(value) => {
          selectedCountryChange(value);
        }}
      />

      <Select
        label="Select a bank"
        placeholder="Pick a bank"
        data={banks.map((bank) => bank.name)}
        filter={optionsFilter}
        searchable
        nothingFoundMessage="No banks found"
        checkIconPosition="right"
        allowDeselect={false}
        withScrollArea={false}
        styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
        mt="md"
        onChange={(bankName) => {
          setSelectedBank(banks.find((x) => x.name === bankName) ?? null);
          setCanContinue(bankName !== null || bankName !== undefined);
        }}
      />
      {
        // <SearchableListView
        //   items={banks}
        //   emptyView={
        //     <Stack>
        //       <Text>No banks found</Text>
        //       <Text>
        //         Some bank names are different than their commercial names.
        //         Please try another name for the bank
        //       </Text>
        //     </Stack>
        //   }
        //   itemTemplate={(institution: InstitutionDto) => {
        //     return (
        //       <InstitutionRow
        //         institution={institution}
        //         onRowSelected={(institution: InstitutionDto) => {
        //           onCreateConnection(institution);
        //         }}
        //       />
        //     );
        //   }}
        // />
      }

      <Button
        loading={isLoading}
        disabled={!canContinue}
        onClick={() => {
          if (selectedBank) {
            onCreateConnection(selectedBank);
          }
        }}
      >
        Add Connection
      </Button>
    </Stack>
  );
}

const optionsFilter: OptionsFilter = ({ options, search }) => {
  const splittedSearch = search.toLowerCase().trim().split(" ");
  return (options as ComboboxItem[]).filter((option) => {
    const words = option.label.toLowerCase().trim().split(" ");
    return splittedSearch.every((searchWord) =>
      words.some((word) => word.includes(searchWord))
    );
  });
};

interface InstitutionRowProps {
  institution: InstitutionDto;
  onRowSelected: (institution: InstitutionDto) => void;
}
function InstitutionRow({ institution, onRowSelected }: InstitutionRowProps) {
  return (
    <Group
      onClick={() => {
        onRowSelected(institution);
      }}
    >
      <Avatar src={institution.logo} alt={institution.name} radius="sm" />
      <Text>{institution.name}</Text>
    </Group>
  );
}
