import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  useAccounts,
  useCategories,
  useInfiniteTransactionInbox,
  useTransactionMutations,
} from "@guallet/api-react"
import { ArrowDownLeftIcon, ArrowUpRightIcon, SearchIcon } from "lucide-react"

import { CategoryAvatar } from "@/components/category-avatar"
import { CategoryPickerDialog } from "@/components/category-picker-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TransactionType = "income" | "expense"
type InboxStatus = "pending" | "suggested" | "categorized"
type DisplayInboxTransaction = {
  id: string
  categoryId: string | null
  date: Date
  description: string
  account: string
  category: string
  currency: string
  amount: number
  type: TransactionType
  status: InboxStatus
  ruleId: string | null
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const statusFilters: Array<{ label: string; value: "all" | InboxStatus }> = [
  { label: "Any status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Suggested", value: "suggested" },
  { label: "Categorized", value: "categorized" },
]

export function TransactionsInboxScreen() {
  const navigate = useNavigate({ from: "/transactions/inbox" })
  const {
    transactions,
    metadata,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactionInbox()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const { updateTransactionCategoryMutation } = useTransactionMutations()

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | InboxStatus>("all")
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<DisplayInboxTransaction | null>(null)

  const accountById = useMemo(() => {
    return new Map(accounts.map((account) => [account.id, account]))
  }, [accounts])

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]))
  }, [categories])

  const mappedTransactions = useMemo<DisplayInboxTransaction[]>(() => {
    return transactions.map((transaction) => {
      const accountName = accountById.get(transaction.accountId)?.name

      const resolvedCategoryId =
        transaction.categoryId ?? transaction.processedCategoryId ?? null
      const categoryName = resolvedCategoryId
        ? categoryById.get(resolvedCategoryId)?.name
        : null

      const status: InboxStatus = transaction.categoryId
        ? "categorized"
        : transaction.processedCategoryId
          ? "suggested"
          : "pending"

      return {
        id: transaction.id,
        categoryId: resolvedCategoryId,
        date: transaction.date,
        description: transaction.description,
        account: accountName ?? "Unknown account",
        category: categoryName ?? "untagged",
        currency: transaction.currency,
        amount: Math.abs(transaction.amount),
        type: transaction.amount >= 0 ? "income" : "expense",
        status,
        ruleId: transaction.ruleId ?? null,
      }
    })
  }, [accountById, categoryById, transactions])

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return mappedTransactions.filter((transaction) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        transaction.description.toLowerCase().includes(normalizedQuery) ||
        transaction.account.toLowerCase().includes(normalizedQuery) ||
        transaction.category.toLowerCase().includes(normalizedQuery)

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [mappedTransactions, query, statusFilter])

  const metrics = useMemo(() => {
    return {
      total: filteredTransactions.length,
      pending: filteredTransactions.filter((item) => item.status === "pending")
        .length,
      suggested: filteredTransactions.filter(
        (item) => item.status === "suggested"
      ).length,
      categorized: filteredTransactions.filter(
        (item) => item.status === "categorized"
      ).length,
    }
  }, [filteredTransactions])

  const openEditCategoryDialog = (transaction: DisplayInboxTransaction) => {
    setSelectedTransaction(transaction)
    setIsCategoryDialogOpen(true)
  }

  const handleCategoryDialogOpenChange = (isOpen: boolean) => {
    setIsCategoryDialogOpen(isOpen)

    if (!isOpen) {
      setSelectedTransaction(null)
    }
  }

  const handleCategorySelected = async (categoryId: string) => {
    if (!selectedTransaction) {
      return
    }

    const transactionId = selectedTransaction.id

    try {
      await updateTransactionCategoryMutation.mutateAsync({
        id: transactionId,
        categoryId,
      })
    } catch (mutationError) {
      console.error("Failed to update transaction category", mutationError)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Inbox total" value={`${metrics.total}`} />
        <MetricCard
          label="Pending"
          value={`${metrics.pending}`}
          tone="pending"
        />
        <MetricCard
          label="Suggested"
          value={`${metrics.suggested}`}
          tone="suggested"
        />
        <MetricCard
          label="Categorized"
          value={`${metrics.categorized}`}
          tone="categorized"
        />
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Transactions inbox</CardTitle>
              <CardDescription>
                Items that still need your review and category confirmation.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                navigate({ to: "/transactions" })
              }}
            >
              Back to transactions
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto]">
            <label className="relative block">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                }}
                placeholder="Search by description, account, or category"
                className="pl-8"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={
                    filter.value === statusFilter ? "secondary" : "outline"
                  }
                  onClick={() => {
                    setStatusFilter(filter.value)
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading inbox...
            </p>
          ) : null}

          {isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center text-sm">
              <p className="text-destructive">
                Failed to load inbox
                {error instanceof Error ? `: ${error.message}` : "."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  void refetch()
                }}
              >
                Try again
              </Button>
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <div className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-24 text-center">Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No inbox transactions match your current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {dateFormatter.format(transaction.date)}
                        </TableCell>
                        <TableCell className="w-24 text-center">
                          <button
                            type="button"
                            className="mx-auto inline-flex items-center rounded-md px-1 py-0.5 text-left hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={() => {
                              openEditCategoryDialog(transaction)
                            }}
                            aria-label={`Change category for ${transaction.description}`}
                          >
                            <CategoryAvatar
                              categoryId={transaction.categoryId}
                              size="sm"
                            />
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {transaction.type === "income" ? (
                              <ArrowDownLeftIcon className="size-3.5 text-emerald-600" />
                            ) : (
                              <ArrowUpRightIcon className="size-3.5 text-rose-600" />
                            )}
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>
                          <StatusBadge status={transaction.status} />
                          {transaction.ruleId ? (
                            <div className="text-xs text-muted-foreground">
                              Rule: {transaction.ruleId}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell
                          className={
                            transaction.type === "income"
                              ? "text-right font-semibold text-emerald-600"
                              : "text-right font-semibold text-rose-600"
                          }
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Loaded {mappedTransactions.length}
                  {metadata?.total ? ` of ${metadata.total}` : ""} inbox
                  transactions.
                </p>
                {hasNextPage ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      void fetchNextPage()
                    }}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Loading more..." : "Load more"}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <CategoryPickerDialog
        open={isCategoryDialogOpen}
        onOpenChange={handleCategoryDialogOpenChange}
        selectedCategoryId={selectedTransaction?.categoryId ?? null}
        title="Change transaction category"
        description={
          selectedTransaction
            ? selectedTransaction.description
            : "Select a category for this transaction."
        }
        onCategorySelected={(categoryId) => {
          void handleCategorySelected(categoryId)
        }}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: InboxStatus }) {
  if (status === "categorized") {
    return <Badge variant="secondary">Categorized</Badge>
  }

  if (status === "suggested") {
    return <Badge variant="outline">Suggested</Badge>
  }

  return <Badge variant="destructive">Pending</Badge>
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "pending" | "suggested" | "categorized"
}) {
  return (
    <Card size="sm">
      <CardHeader className="gap-0 pb-0">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={
            tone === "categorized"
              ? "text-xl font-semibold text-emerald-600"
              : tone === "suggested"
                ? "text-xl font-semibold text-amber-600"
                : tone === "pending"
                  ? "text-xl font-semibold text-rose-600"
                  : "text-xl font-semibold"
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
