import { SankeyChart } from '@mantine/charts';
import { Box, ScrollArea, Text } from '@mantine/core';
import { useTheme } from '@guallet/ui-react';
import { useTranslation } from 'react-i18next';
import {
  getMoneyFlowChartData,
  type MoneyFlowAmounts,
} from '@/features/reports/models/moneyFlow';

interface Props {
  amounts: MoneyFlowAmounts;
  formatAmount: (amount: number) => string;
}

export function MoneyFlowChart({ amounts, formatAmount }: Readonly<Props>) {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius } = useTheme();
  const labelHeight = spacing.xl;
  const labelWidth = spacing.xxl * 3;
  const nodeWidth = spacing.sm + spacing.xs;
  const horizontalMargin = labelWidth + spacing.md;
  const cashFlowLabel = t('screens.reports.moneyFlow.cashFlow', 'Cash flow');
  const data = getMoneyFlowChartData(amounts, {
    total: cashFlowLabel,
    surplus: t('screens.reports.moneyFlow.leftOver', 'Left over'),
    shortfall: t('screens.reports.moneyFlow.shortfall', 'Shortfall'),
  });
  const { nodes, links, maxColumnSize } = data;
  const nodeColors = {
    income: colors.support.primary,
    expense: colors.status.error,
    total: colors.accent.primary,
    surplus: colors.accent.primary,
    shortfall: colors.neutral.midGrey,
  };
  const getNodeColor = (node: (typeof nodes)[number]) =>
    node.uncategorised ? colors.neutral.midGrey : nodeColors[node.kind];

  return (
    <ScrollArea type="auto" scrollbars="x">
      <Box miw={spacing.xxl * 17} aria-hidden>
        <Box
          mx={horizontalMargin + nodeWidth / 2}
          pos="relative"
          style={{ whiteSpace: 'nowrap' }}
        >
          <Text
            size="sm"
            fw={600}
            pos="absolute"
            left={0}
            style={{ transform: 'translateX(-50%)' }}
          >
            {amounts.net < 0
              ? t(
                  'screens.reports.moneyFlow.incomeAndShortfall',
                  'Income and shortfall',
                )
              : t(
                  'screens.reports.moneyFlow.incomeCategories',
                  'Income categories',
                )}
          </Text>
          <Text size="sm" fw={600} ta="center">
            {cashFlowLabel}
          </Text>
          <Text
            size="sm"
            fw={600}
            pos="absolute"
            top={0}
            right={0}
            style={{ transform: 'translateX(50%)' }}
          >
            {amounts.net > 0
              ? t(
                  'screens.reports.moneyFlow.spendingAndRemainder',
                  'Spending and remainder',
                )
              : t(
                  'screens.reports.moneyFlow.spendingCategories',
                  'Spending categories',
                )}
          </Text>
        </Box>
        <SankeyChart
          data={data}
          height={Math.max(spacing.xxl * 10, maxColumnSize * labelHeight * 1.5)}
          nodeWidth={nodeWidth}
          nodePadding={labelHeight}
          withTooltip={false}
          sankeyProps={{
            sort: false,
            margin: {
              top: spacing.md,
              bottom: spacing.md,
              left: horizontalMargin,
              right: horizontalMargin,
            },
            node: ({ x, y, width, height, index }) => {
              const node = nodes[index];
              const left = node.kind === 'income' || node.kind === 'shortfall';
              const amount = formatAmount(node.amount);

              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={borderRadius.xs}
                    fill={getNodeColor(node)}
                  />
                  {node.kind !== 'total' && (
                    <foreignObject
                      x={
                        left
                          ? x - labelWidth - spacing.sm
                          : x + width + spacing.sm
                      }
                      y={y + (height - labelHeight) / 2}
                      width={labelWidth}
                      height={labelHeight}
                    >
                      <Box
                        ta={left ? 'right' : 'left'}
                        title={`${node.fullName} · ${amount}`}
                      >
                        <Text size="xs" fw={600} lh={1.25} truncate>
                          {node.name}
                        </Text>
                        <Text
                          size="xs"
                          fw={500}
                          lh={1.25}
                          c={
                            node.amount < 0
                              ? colors.status.error
                              : colors.support.dark
                          }
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                          truncate
                        >
                          {amount}
                        </Text>
                      </Box>
                    </foreignObject>
                  )}
                </g>
              );
            },
            link: ({
              index,
              sourceX,
              sourceY,
              targetX,
              targetY,
              sourceControlX,
              targetControlX,
              linkWidth,
            }) => {
              const { source, target } = links[index];
              const node =
                nodes[source].kind === 'total' ? nodes[target] : nodes[source];
              const half = linkWidth / 2;
              const path = [
                `M ${sourceX},${sourceY - half}`,
                `C ${sourceControlX},${sourceY - half} ${targetControlX},${targetY - half} ${targetX},${targetY - half}`,
                `L ${targetX},${targetY + half}`,
                `C ${targetControlX},${targetY + half} ${sourceControlX},${sourceY + half} ${sourceX},${sourceY + half}`,
                'Z',
              ].join(' ');

              return (
                <path d={path} fill={getNodeColor(node)} fillOpacity={0.24} />
              );
            },
          }}
        />
      </Box>
    </ScrollArea>
  );
}
