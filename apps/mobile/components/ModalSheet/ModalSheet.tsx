import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Icon, Label, Spacing } from "@guallet/ui-react-native";
import { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";

interface ModalSheetProps {
  title: string;
  children: React.ReactNode;
  snapPoints?: string[];
  isOpen?: boolean;
  onClose?: () => void;
}

export function ModalSheet({
  title,
  isOpen,
  onClose,
  snapPoints,
  children,
}: ModalSheetProps) {
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
      //   enableDynamicSizing={true}
      snapPoints={snapPoints || ["90%"]}
      onDismiss={onClose}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.modalContentContainer}
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
          {children}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    flex: 1,
    alignItems: "stretch",
  },
});
