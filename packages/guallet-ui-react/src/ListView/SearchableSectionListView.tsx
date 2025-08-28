import { Stack, Text } from "@mantine/core";
import { SearchBoxInput } from "../SearchBoxInput/SearchBoxInput";
import React, { useState, useEffect } from "react";

export interface Section<T> {
  title: string;
  data: T[];
}

interface SearchableSectionLisProps<T> {
  data: Section<T>[];
  sectionWrapperTemplate?: (
    children: React.ReactNode
  ) => React.ReactNode | null;
  sectionHeaderTemplate: (section: Section<T>) => React.ReactNode;
  itemTemplate: (item: T, index: number) => React.ReactNode;
  emptyView?: React.ReactNode;
  placeholder?: string;
}

export function SearchableSectionListView<T>({
  data,
  sectionWrapperTemplate,
  sectionHeaderTemplate,
  itemTemplate,
  emptyView,
  placeholder,
}: Readonly<SearchableSectionLisProps<T>>) {
  const [filteredData, setFilteredData] = useState(data);
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    if (!queryString.trim()) {
      setFilteredData(data);
    } else {
      const filtered = data
        .map((section) => ({
          ...section,
          data: section.data.filter((item) =>
            // TODO: Improve this hack of converting to JSON
            JSON.stringify(item)
              .toLowerCase()
              .includes(queryString.toLowerCase())
          ),
        }))
        .filter((section) => section.data.length > 0);

      setFilteredData(filtered);
    }
  }, [data, queryString]);

  return (
    <Stack>
      <SearchBoxInput
        placeholder={placeholder}
        query={queryString}
        onSearchQueryChanged={(query) => {
          setQueryString(query);
        }}
      />
      {filteredData.length === 0 && (emptyView || <DefaultEmptyView />)}
      {filteredData.map((section) => (
        <Stack key={section.title}>
          {sectionHeaderTemplate(section)}
          {sectionWrapperTemplate ? (
            sectionWrapperTemplate(
              <>
                {section.data.map((item, index) => itemTemplate(item, index))}
              </>
            )
          ) : (
            <>{section.data.map((item, index) => itemTemplate(item, index))}</>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function DefaultEmptyView() {
  return (
    <Stack>
      <Text>No items found</Text>
    </Stack>
  );
}
