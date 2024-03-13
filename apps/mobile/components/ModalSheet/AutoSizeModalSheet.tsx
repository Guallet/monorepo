import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Icon, Label, Spacing } from "@guallet/ui-react-native";
import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AutoSizeModalSheetProps
  extends React.ComponentProps<typeof BottomSheetModal> {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function AutoSizeModalSheet({
  title,
  isOpen,
  onClose,
  children,
  ...props
}: AutoSizeModalSheetProps) {
  // hooks
  const filtersBottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      openFilters();
    } else {
      closeFilters();
    }
  }, [isOpen]);

  // callbacks
  const closeFilters = useCallback(() => {
    filtersBottomSheetModalRef.current?.dismiss();
    onClose?.();
  }, []);
  const openFilters = useCallback(() => {
    filtersBottomSheetModalRef.current?.present();
  }, []);

  return (
    <BottomSheetModal
      ref={filtersBottomSheetModalRef}
      enablePanDownToClose={true}
      enableDynamicSizing={true}
      onDismiss={onClose}
      {...props}
    >
      <BottomSheetView
        style={{
          paddingTop: 12,
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}
        enableFooterMarginAdjustment={true}
      >
        <View>
          <View
            style={{
              marginBottom: Spacing.medium,
              marginTop: Spacing.small,
              justifyContent: "center",
            }}
          >
            <Label
              style={{
                flexGrow: 1,
                marginHorizontal: Spacing.extraLarge,
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
              numberOfLines={1}
            >
              {title}
            </Label>
            <View
              style={{
                position: "absolute",
                alignSelf: "flex-end",
              }}
            >
              <Icon
                name="xmark"
                size={30}
                onPress={() => {
                  closeFilters();
                }}
                style={{
                  marginHorizontal: Spacing.medium,
                }}
              />
            </View>
          </View>
          <View>{children}</View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
