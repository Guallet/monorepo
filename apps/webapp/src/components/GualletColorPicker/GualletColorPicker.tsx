import { ColorInput } from "@mantine/core";
import { useTranslation } from "react-i18next";

const defaultSwatches = [
  "#25262b",
  "#868e96",
  "#fa5252",
  "#e64980",
  "#be4bdb",
  "#7950f2",
  "#4c6ef5",
  "#228be6",
  "#15aabf",
  "#12b886",
  "#40c057",
  "#82c91e",
  "#fab005",
  "#fd7e14",
  "#fd7e14",
  "#fd7e14",
];

interface GualletColorPickerProps
  extends React.ComponentProps<typeof ColorInput> {
  onColourSelected: (colour: string) => void;
}

export function GualletColorPicker({
  value,
  onColourSelected,
  ...props
}: Readonly<GualletColorPickerProps>) {
  const { t } = useTranslation();

  return (
    <ColorInput
      closeOnColorSwatchClick
      label={t("components.colorPicker.label", "Colour")}
      placeholder={t("components.colorPicker.placeholder", "Select the colour")}
      defaultValue="#4c6ef5"
      onChangeEnd={(colour: string) => {
        onColourSelected(colour);
      }}
      format="hex"
      swatches={defaultSwatches}
      {...props}
    />
  );
}
