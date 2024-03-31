import { ActionIcon, Label, Row, Spacing } from "@guallet/ui-react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ModalSheet } from "./ModalSheet/ModalSheet";
import { FlatList } from "react-native-gesture-handler";
import { SearchBoxInput } from "./SearchBoxInput";

interface BasePickerProps<T>
  extends React.ComponentProps<typeof TouchableOpacity> {
  items: T[];
  selectedItem: T | null;
  placeholder: string;
  modalTitle?: string;
  renderItem: (item: T) => JSX.Element;
  onItemSelected: (item: T | null) => void;
  renderButton: (item: T) => JSX.Element;
  searchable?: boolean;
}

export function BasePicker<T>({
  items,
  selectedItem,
  placeholder,
  renderButton,
  renderItem,
  onItemSelected,
  searchable = true,
  modalTitle,
  ...props
}: BasePickerProps<T>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredItems(items);
    } else {
      setFilteredItems(
        items.filter((item) => {
          return JSON.stringify(item)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        })
      );
    }
  }, [searchQuery, items]);

  return (
    <TouchableOpacity
      style={[props.style]}
      onPress={() => {
        setIsModalOpen(true);
      }}
    >
      {selectedItem ? (
        <Row
          style={{
            backgroundColor: "white",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexGrow: 1,
            }}
          >
            {renderButton(selectedItem)}
          </View>

          <ActionIcon
            name="circle-xmark"
            style={{
              marginEnd: Spacing.small,
            }}
            size={24}
            onClick={() => {
              onItemSelected(null);
            }}
          />
        </Row>
      ) : (
        <Row
          style={{
            backgroundColor: "white",
            height: 50,
            paddingHorizontal: Spacing.medium,
          }}
        >
          <Label>{placeholder}</Label>
        </Row>
      )}
      <ModalSheet
        title={modalTitle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      >
        {searchable && (
          <SearchBoxInput
            style={{
              marginHorizontal: Spacing.medium,
              marginBottom: Spacing.small,
            }}
            query={searchQuery}
            onSearchQueryChanged={(newSearchQuery: string) => {
              setSearchQuery(newSearchQuery);
            }}
          />
        )}
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  console.log("Selected item", item);
                  onItemSelected(item);
                  setIsModalOpen(false);
                }}
              >
                {renderItem(item)}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Label
              style={{
                paddingHorizontal: Spacing.medium,
              }}
            >
              No items found
            </Label>
          }
        />
      </ModalSheet>
    </TouchableOpacity>
  );
}
