import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Icon, Spacing } from "@guallet/ui-react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Button, BackHandler } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

interface SelectInputProps<T> {
  label?: string;
  description?: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  data: T[];
  itemTemplate: (item: T) => React.ReactNode;
  onItemSelected: (item: T) => void;
}

export function SelectInput<T>({
  label,
  description,
  value,
  required,
  disabled,
  error,
  data,
  itemTemplate,
  onItemSelected,
}: SelectInputProps<T>) {
  // handle back button
  const { dismiss } = useBottomSheetModal();

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
        flex: 1,
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
        <Text>{value}</Text>
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
              Select a currency
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

          <View
            style={{
              flex: 1,
              flexGrow: 1,
              justifyContent: "flex-start",
              flexDirection: "column",
              alignContent: "stretch",
            }}
          >
            {data.map((item, index) => {
              return (
                // TODO: Fix the key warning
                <TouchableOpacity
                  key={index}
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
              );
            })}
          </View>
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
