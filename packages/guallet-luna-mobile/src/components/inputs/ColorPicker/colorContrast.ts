type ProcessedColor = number | object | null | undefined;

type Rgb = { red: number; green: number; blue: number };

/** Compare the theme's dark and light inks against the visible swatch color. */
export function shouldUseDarkCheck(
  swatch: ProcessedColor,
  backdrop: ProcessedColor,
  darkInk: ProcessedColor,
  lightInk: ProcessedColor,
): boolean {
  if (
    typeof swatch !== 'number' ||
    typeof backdrop !== 'number' ||
    typeof darkInk !== 'number' ||
    typeof lightInk !== 'number'
  ) {
    return false;
  }

  const visibleSwatch = composite(swatch, channels(backdrop));
  const swatchLuminance = luminance(visibleSwatch);
  return (
    contrast(swatchLuminance, luminance(composite(darkInk, visibleSwatch))) >=
    contrast(swatchLuminance, luminance(composite(lightInk, visibleSwatch)))
  );
}

/** React Native's processColor returns an ARGB integer. */
function channels(color: number): Rgb {
  return {
    red: (color >>> 16) & 0xff,
    green: (color >>> 8) & 0xff,
    blue: color & 0xff,
  };
}

function composite(foreground: number, background: Rgb): Rgb {
  const opacity = (foreground >>> 24) / 255;
  const color = channels(foreground);
  return {
    red: color.red * opacity + background.red * (1 - opacity),
    green: color.green * opacity + background.green * (1 - opacity),
    blue: color.blue * opacity + background.blue * (1 - opacity),
  };
}

function luminance({ red, green, blue }: Rgb): number {
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return linear(red) * 0.2126 + linear(green) * 0.7152 + linear(blue) * 0.0722;
}

function contrast(first: number, second: number): number {
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
