import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { SavingGoalDto } from '@guallet/api-client';

vi.mock('react-native', () => {
  function mockElement(tag: string) {
    return ({
      children,
      style,
      accessibilityRole,
      accessibilityLabel,
      accessibilityValue,
      ...props
    }: Record<string, unknown>) => {
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style)
        : style;
      return React.createElement(
        tag,
        {
          ...props,
          style: flatStyle,
          role: accessibilityRole,
          'aria-label': accessibilityLabel,
          'aria-valuenow': (accessibilityValue as { now?: number } | undefined)
            ?.now,
        },
        children as React.ReactNode,
      );
    };
  }
  return {
    Pressable: mockElement('button'),
    Text: mockElement('span'),
    View: mockElement('div'),
    StyleSheet: { create: (styles: unknown) => styles },
  };
});

vi.mock('@guallet/luna-mobile', () => ({
  useTheme: () => ({
    colors: {
      text: { primary: '#231f20', secondary: '#425563' },
      surface: {
        background: { primary: '#fff' },
        border: { primary: '#e5e7eb' },
      },
      status: { error: '#da291c', success: '#009639' },
      support: { primary: '#009639' },
      accent: { primary: '#005eb8' },
    },
    borderRadius: { lg: 16 },
    spacing: { md: 16, sm: 8 },
    typography: { sizes: { lg: 20, sm: 14, xs: 12 } },
  }),
}));

import { GoalCard } from './GoalCard';

describe('GoalCard progress rendering', () => {
  it('shows amount, percentage, linked account, and progress value', () => {
    const goal = {
      id: 'g',
      name: 'Emergency fund',
      targetAmount: 1000,
      currentAmount: 640,
      remainingAmount: 360,
      progressPercentage: 64,
      currency: 'GBP',
      isCompleted: false,
      isOverdue: false,
    } as SavingGoalDto;
    const html = renderToStaticMarkup(
      <GoalCard
        goal={goal}
        accountNames="Savings account"
        onPress={() => {}}
      />,
    );
    expect(html).toContain('Emergency fund');
    expect(html).toContain('£640');
    expect(html).toContain('64%');
    expect(html).toContain('Savings account');
    expect(html).toContain('aria-valuenow="64"');
    expect(html).toContain('width:64%');
  });
});
