import { describe, expect, it } from 'vitest';
import { defaultColors, defaultDarkColors } from '@guallet/theme';
import { getButtonInteractionState, getButtonStyles } from './buttonStyles';

describe('getButtonInteractionState', () => {
  it('prioritizes disabled, pressed, focused, and selected states', () => {
    expect(
      getButtonInteractionState({
        disabled: true,
        focused: true,
        pressed: true,
        selected: true,
      }),
    ).toBe('disabled');
    expect(
      getButtonInteractionState({
        disabled: false,
        focused: true,
        pressed: true,
        selected: true,
      }),
    ).toBe('pressed');
    expect(
      getButtonInteractionState({
        disabled: false,
        focused: true,
        pressed: false,
        selected: true,
      }),
    ).toBe('focus');
    expect(
      getButtonInteractionState({
        disabled: false,
        focused: false,
        pressed: false,
        selected: true,
      }),
    ).toBe('selected');
  });
});

describe('getButtonStyles', () => {
  it('uses primary interaction colors for filled buttons', () => {
    expect(getButtonStyles(defaultColors, 'filled', 'default')).toEqual({
      backgroundColor: defaultColors.button.primary.default,
      textColor: defaultColors.button.onPrimary.default,
    });
    expect(getButtonStyles(defaultColors, 'filled', 'pressed')).toEqual({
      backgroundColor: defaultColors.button.primary.pressed,
      textColor: defaultColors.button.onPrimary.pressed,
    });
  });

  it('keeps outline buttons transparent while changing their border state', () => {
    expect(getButtonStyles(defaultDarkColors, 'outline', 'hover')).toEqual({
      backgroundColor: defaultDarkColors.button.transparent.default,
      borderColor: defaultDarkColors.button.outline.hover,
      borderWidth: 1,
      textColor: defaultDarkColors.button.outline.hover,
    });
  });

  it('uses accessible disabled colors for filled and outline buttons', () => {
    expect(getButtonStyles(defaultColors, 'filled', 'disabled')).toEqual({
      backgroundColor: defaultColors.button.disabled.default,
      textColor: defaultColors.text.disabled,
    });
    expect(getButtonStyles(defaultColors, 'outline', 'disabled')).toEqual({
      backgroundColor: defaultColors.button.transparent.default,
      borderColor: defaultColors.button.outline.disabled,
      borderWidth: 1,
      textColor: defaultColors.text.disabled,
    });
  });
});
