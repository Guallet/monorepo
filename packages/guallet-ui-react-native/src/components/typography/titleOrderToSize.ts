export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export const titleOrderToSize: Record<TitleOrder, TitleSize> = {
  1: 'xxl',
  2: 'xl',
  3: 'lg',
  4: 'md',
  5: 'sm',
  6: 'xs',
};
