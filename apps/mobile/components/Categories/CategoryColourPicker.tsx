import { Icon, Label, Spacing } from "@guallet/ui-react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { SelectInput } from "../SelectInput";
import { View } from "react-native";
import { useCallback, useMemo, useRef } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";

interface CategoryColourPickerProps {
  colour: string;
  onColourChange: (colour: string) => void;
}

const availableColours = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#008000",
  "#000080",
  "#800000",
  "#008080",
  "#808000",
  "#C0C0C0",
  "#808080",
  "#FFC0CB",
  "#00CED1",
  "#FFA07A",
  "#7B68EE",
  "#FFD700",
  "#8A2BE2",
  "#00FF7F",
  "#FF1493",
  "#00BFFF",
];

export function CategoryColourPicker({
  colour,
  onColourChange,
}: CategoryColourPickerProps) {
  // hooks
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { dismiss } = useBottomSheetModal();

  // variables
  const snapPoints = useMemo(() => ["50%", "90%"], []);

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
        openModal();
      }}
    >
      <View
        style={[
          {
            height: 48,
            borderWidth: 1,
            borderRadius: 20,
            padding: 8,
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
          },
        ]}
      >
        <Label
          style={{
            fontWeight: "bold",
          }}
        >
          Category colour
        </Label>
        <View
          style={{
            backgroundColor: colour,
            height: 32,
            width: 32,
            borderRadius: 16,
          }}
        />
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
      >
        <BottomSheetView
          style={{
            flex: 1,
            alignItems: "stretch",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: Spacing.medium,
              marginTop: Spacing.small,
            }}
          >
            <Label
              style={{
                flexGrow: 1,
                marginHorizontal: Spacing.medium,
                textAlign: "center",
              }}
            >
              Select a color
            </Label>
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

          <FlatList
            data={availableColours}
            numColumns={4}
            renderItem={({ item }) => (
              <ColorItem
                color={item}
                onSelected={(colour) => {
                  onColourChange(colour);
                  dismiss();
                }}
              />
            )}
          />

          <View></View>
        </BottomSheetView>
      </BottomSheetModal>
    </TouchableOpacity>
  );
}

function ColorItem({
  color,
  onSelected,
}: {
  color: string;
  onSelected: (color: string) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        onSelected(color);
      }}
      style={{
        padding: Spacing.medium,
      }}
    >
      <View
        style={{
          backgroundColor: color,
          height: 50,
          width: 50,
          borderRadius: 25,
        }}
      />
    </TouchableOpacity>
  );
}
