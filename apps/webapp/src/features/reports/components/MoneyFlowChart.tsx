import { SankeyChart } from '@mantine/charts';
import { Box, ScrollArea, Text, type ScrollAreaProps } from '@mantine/core';
import { useTheme } from '@guallet/ui-react';
import { useTranslation } from 'react-i18next';
import type { SankeyLinkProps, SankeyNodeProps } from 'recharts';
import {
  getMoneyFlowChartData,
  type MoneyFlowAmounts,
  type MoneyFlowNode,
} from '@/features/reports/models/moneyFlow';

interface Props extends ScrollAreaProps {
  amounts: MoneyFlowAmounts;
  formatAmount: (amount: bigint) => string;
}

export function MoneyFlowChart({
  amounts,
  formatAmount,
  ...props
}: Readonly<Props>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const labelHeight = Math.max(
    spacing.xl,
    2 * typography.sizes.xs * typography.lineHeights.tight,
  );
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
  const getNodeColor = (node: MoneyFlowNode) =>
    node.uncategorised ? colors.neutral.midGrey : nodeColors[node.kind];

  return (
    <ScrollArea type="auto" scrollbars="x" {...props}>
      <Box miw={spacing.xxl * 17} aria-hidden>
        <Box
          mx={horizontalMargin + nodeWidth / 2}
          pos="relative"
          style={{ whiteSpace: 'nowrap' }}
        >
          <Text
            fz={typography.sizes.sm}
            fw={typography.weights.semibold}
            pos="absolute"
            left={0}
            style={{ transform: 'translateX(-50%)' }}
          >
            {amounts.net < 0n
              ? t(
                  'screens.reports.moneyFlow.incomeAndShortfall',
                  'Income and shortfall',
                )
              : t(
                  'screens.reports.moneyFlow.incomeCategories',
                  'Income categories',
                )}
          </Text>
          <Text
            fz={typography.sizes.sm}
            fw={typography.weights.semibold}
            ta="center"
          >
            {cashFlowLabel}
          </Text>
          <Text
            fz={typography.sizes.sm}
            fw={typography.weights.semibold}
            pos="absolute"
            top={0}
            right={0}
            style={{ transform: 'translateX(50%)' }}
          >
            {amounts.net > 0n
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
            node: (nodeProps) => {
              const node = nodes[nodeProps.index];
              return renderMoneyFlowNode(
                nodeProps,
                node,
                {
                  color: getNodeColor(node),
                  amount: formatAmount(node.amount),
                  labelWidth,
                  labelHeight,
                },
                theme,
              );
            },
            link: (linkProps) => {
              const { index } = linkProps;
              const { source, target } = links[index];
              const node =
                nodes[source].kind === 'total' ? nodes[target] : nodes[source];
              return renderMoneyFlowLink(linkProps, getNodeColor(node));
            },
          }}
        />
      </Box>
    </ScrollArea>
  );
}

function renderMoneyFlowNode(
  { x, y, width, height }: SankeyNodeProps,
  node: MoneyFlowNode,
  {
    color,
    amount,
    labelWidth,
    labelHeight,
  }: {
    color: string;
    amount: string;
    labelWidth: number;
    labelHeight: number;
  },
  { colors, spacing, borderRadius, typography }: ReturnType<typeof useTheme>,
) {
  const left = node.kind === 'income' || node.kind === 'shortfall';
  const amountColor =
    node.amount < 0n ? colors.status.error : colors.support.dark;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={borderRadius.xs}
        fill={color}
      />
      {node.kind !== 'total' && (
        <foreignObject
          x={left ? x - labelWidth - spacing.sm : x + width + spacing.sm}
          y={y + (height - labelHeight) / 2}
          width={labelWidth}
          height={labelHeight}
        >
          <Box
            ta={left ? 'right' : 'left'}
            title={`${node.fullName} · ${amount}`}
          >
            <Text
              fz={typography.sizes.xs}
              fw={typography.weights.semibold}
              lh={typography.lineHeights.tight}
              truncate
            >
              {node.name}
            </Text>
            <Text
              fz={typography.sizes.xs}
              fw={typography.weights.medium}
              lh={typography.lineHeights.tight}
              c={amountColor}
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
}

function renderMoneyFlowLink(
  {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
  }: SankeyLinkProps,
  color: string,
) {
  const half = linkWidth / 2;
  const path = [
    `M ${sourceX},${sourceY - half}`,
    `C ${sourceControlX},${sourceY - half} ${targetControlX},${targetY - half} ${targetX},${targetY - half}`,
    `L ${targetX},${targetY + half}`,
    `C ${targetControlX},${targetY + half} ${sourceControlX},${sourceY + half} ${sourceX},${sourceY + half}`,
    'Z',
  ].join(' ');

  return <path d={path} fill={color} fillOpacity={0.24} />;
}
