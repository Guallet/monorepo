import { Icon, Spacing } from "@guallet/ui-react-native";
import { TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { CategoryIcon } from "./CategoryIcon";
import { FlatList } from "react-native-gesture-handler";
import { AutoSizeModalSheet } from "../ModalSheet/AutoSizeModalSheet";

interface CategoryIconPickerProps {
  icon: string;
  colour: string;
  onIconChange: (icon: string) => void;
}

export function CategoryIconPicker({
  icon,
  colour,
  onIconChange,
}: CategoryIconPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          setIsModalOpen(true);
        }}
        style={{
          borderRadius: 50,
          height: 100,
          width: 100,
          borderWidth: 1,
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
        }}
      >
        <CategoryIcon name={icon} color={colour} size={50} isFontAwesomeName />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            end: -Spacing.medium,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 50,
            backgroundColor: "#ececec",
            height: 30,
            width: 30,
          }}
        >
          <Icon name="pencil" size={20} />
        </View>
      </TouchableOpacity>

      {/* MODALS */}
      <AutoSizeModalSheet
        title="Select icon"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={availableIcons}
          numColumns={4}
          renderItem={({ item: iconName }) => {
            return (
              <TouchableOpacity
                style={{
                  padding: Spacing.small,
                }}
                onPress={() => {
                  onIconChange(iconName);
                  setIsModalOpen(false);
                }}
              >
                <CategoryIcon
                  isFontAwesomeName
                  name={iconName}
                  color="black"
                  size={50}
                />
              </TouchableOpacity>
            );
          }}
        />
      </AutoSizeModalSheet>
    </View>
  );
}

const availableIcons = [
  "baby",
  "bicycle",
  "book",
  "camera-retro",
  "car",
  "cart-shopping",
  "cloud",
  "coins",
  "credit-card",
  "dribbble",
  "envelope",
  "gamepad",
  "gas-pump",
  "gift",
  "headphones",
  "heart",
  "house-chimney",
  "key",
  "money-bill",
  "mug-saucer",
  "music",
  "phone",
  "piggy-bank",
  "pizza-slice",
  "plane",
  "plane-departure",
  "poo",
  "receipt",
  "shop",
  "star",
  "trophy",
  "umbrella-beach",
  "user",
  "vault",
  "video",
  "wallet",
];
