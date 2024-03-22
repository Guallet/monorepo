import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Icon, Label, Spacing } from "@guallet/ui-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Button, BackHandler } from "react-native";
import { TouchableOpacity, FlatList } from "react-native-gesture-handler";
import { SearchBoxInput } from "./SearchBoxInput";

interface SelectInputProps<T> {
  label?: string;
  description?: string;
  value?: string;
  displayValue?: string; // If you want to display a different value than the selected value. for example a transformation
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  data: T[];
  searchable?: boolean;
  modalTitle?: string;
  itemTemplate: (item: T) => React.ReactNode;
  onItemSelected: (item: T) => void;
  keyExtractor?: ((item: T, index: number) => string) | undefined;
}

export function SelectInput<T>({
  label,
  description,
  value,
  displayValue,
  required,
  disabled,
  error,
  data,
  searchable,
  modalTitle,
  itemTemplate,
  onItemSelected,
  keyExtractor,
}: SelectInputProps<T>) {
  // handle back button
  const { dismiss } = useBottomSheetModal();
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (query === "" || query === null || query === undefined) {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) => {
        return JSON.stringify(item).toLowerCase().includes(query.toLowerCase());
      });
      setFilteredData(filtered);
    }
  }, [query]);

  useEffect(() => {
    const handleBackButton = () => {
      return dismiss(); // dismiss() returns true/false, it means there is any instance of Bottom Sheet visible on current screen.
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackButton);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButton);
    };
  }, []);

  // hooks
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  //   const snapPoints = useMemo(() => ["90%"], []);

  // callbacks
  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <TouchableOpacity
      style={{
        flexGrow: 1,
      }}
      onPress={() => {
        if (disabled) return;
        openModal();
      }}
    >
      {label && (
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Text>{label}</Text>
          {required && <Text style={{ color: "red" }}>*</Text>}
        </View>
      )}
      {description && <Text>{description}</Text>}
      <View
        style={[
          {
            height: 48,
            borderWidth: 1,
            borderRadius: 20,
            borderColor: error ? "red" : disabled ? "grey" : "blue",
            padding: 8,
            justifyContent: "center",
          },
          disabled && { backgroundColor: "#F8F8F8" },
        ]}
      >
        {!!displayValue ? <Label>{displayValue}</Label> : <Text>{value}</Text>}
      </View>
      {error && (
        <Text
          style={{
            color: "red",
          }}
        >
          {error}
        </Text>
      )}

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
      >
        <BottomSheetView style={styles.modalContentContainer}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: Spacing.medium,
              marginTop: Spacing.small,
            }}
          >
            <Text
              style={{
                flexGrow: 1,
                marginHorizontal: Spacing.medium,
                textAlign: "center",
              }}
            >
              {modalTitle}
            </Text>
            <Icon
              name="xmark"
              size={24}
              onPress={() => {
                bottomSheetModalRef.current?.dismiss();
              }}
              style={{
                marginHorizontal: Spacing.medium,
              }}
            />
          </View>

          {searchable && (
            <SearchBoxInput
              style={{
                marginHorizontal: Spacing.small,
                marginBottom: Spacing.small,
              }}
              query={query}
              onSearchQueryChanged={(query) => {
                setQuery(query);
              }}
            />
          )}

          {filteredData.length === 0 ? (
            <Text style={{ margin: Spacing.medium }}>No items found</Text>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onItemSelected(item);
                    dismiss();
                  }}
                  style={{
                    padding: Spacing.medium,
                    borderBottomWidth: 1,
                    borderBottomColor: "grey",
                    flexDirection: "row",
                  }}
                >
                  {itemTemplate(item)}
                </TouchableOpacity>
              )}
              keyExtractor={keyExtractor}
            />
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    flex: 1,
    alignItems: "stretch",
  },
});
