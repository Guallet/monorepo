import { useEffect, useMemo, useRef, useState } from "react"
import {
  useAccounts,
  useCategories,
  useTransactionMutations,
  useTransactions,
} from "@guallet/api-react"
import { Money } from "@guallet/money"
import { ArrowDownLeftIcon, ArrowUpRightIcon, SearchIcon } from "lucide-react"

import { AcountAvatar } from "@/components/acount-avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TransactionType = "income" | "expense"
type DisplayTransaction = {
  id: string
  accountId: string
  date: Date
  description: string
  notes: string | null
  category: string
  account: string
  currency: string
  type: TransactionType
  amount: number
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const typeFilters: Array<{ label: string; value: "all" | TransactionType }> = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
]

export function TransactionsScreen() {
  const { transactions, isLoading, isError, error, refetch } = useTransactions()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const { updateTransactionNotesMutation } = useTransactionMutations()

  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all")
  const [selectedTransaction, setSelectedTransaction] =
    useState<DisplayTransaction | null>(null)
  const [isEditNotesDialogOpen, setIsEditNotesDialogOpen] = useState(false)
  const [notesDraft, setNotesDraft] = useState("")
  const [editNotesError, setEditNotesError] = useState<string | null>(null)

  const accountById = useMemo(() => {
    return new Map(accounts.map((account) => [account.id, account]))
  }, [accounts])

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]))
  }, [categories])

  const mappedTransactions = useMemo<DisplayTransaction[]>(() => {
    return transactions.map((transaction) => {
      const accountName = accountById.get(transaction.accountId)?.name
      const categoryName = transaction.categoryId
        ? categoryById.get(transaction.categoryId)?.name
        : null

      const type: TransactionType =
        transaction.amount >= 0 ? "income" : "expense"

      return {
        id: transaction.id,
        accountId: transaction.accountId,
        date: transaction.date,
        description: transaction.description,
        notes: transaction.notes,
        category: categoryName ?? "Uncategorized",
        account: accountName ?? "Unknown account",
        currency: transaction.currency,
        type,
        amount: Math.abs(transaction.amount),
      }
    })
  }, [accountById, categoryById, transactions])

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return mappedTransactions.filter((transaction) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        transaction.description.toLowerCase().includes(normalizedQuery) ||
        transaction.category.toLowerCase().includes(normalizedQuery) ||
        transaction.account.toLowerCase().includes(normalizedQuery)

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter

      return matchesQuery && matchesType
    })
  }, [mappedTransactions, query, typeFilter])

  const isSavingNotes = updateTransactionNotesMutation.isPending

  const openEditNotesDialog = (transaction: DisplayTransaction) => {
    setSelectedTransaction(transaction)
    setNotesDraft(transaction.notes ?? "")
    setEditNotesError(null)
    setIsEditNotesDialogOpen(true)
  }

  const handleEditNotesDialogOpenChange = (isOpen: boolean) => {
    setIsEditNotesDialogOpen(isOpen)

    if (!isOpen) {
      setSelectedTransaction(null)
      setNotesDraft("")
      setEditNotesError(null)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedTransaction) {
      return
    }

    setEditNotesError(null)

    try {
      await updateTransactionNotesMutation.mutateAsync({
        id: selectedTransaction.id,
        notes: notesDraft,
      })
      handleEditNotesDialogOpenChange(false)
    } catch (mutationError) {
      setEditNotesError(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update transaction notes."
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Transaction activity</CardTitle>
              <CardDescription>
                Search, filter, and review your latest account activity from the
                API.
              </CardDescription>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto]">
            <label className="relative block">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                }}
                placeholder="Search by description, category, or account"
                className="pl-8"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {typeFilters.map((filter) => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={filter.value === typeFilter ? "default" : "outline"}
                  onClick={() => {
                    setTypeFilter(filter.value)
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
              Loading transactions...
            </p>
          ) : null}

          {isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center text-sm">
              <p className="text-destructive">
                Failed to load transactions
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
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 px-2">
                    <span className="sr-only">Account</span>
                  </TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="w-32 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No transactions match your current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="w-12 px-2 align-top">
                        <AcountAvatar accountId={transaction.accountId} />
                      </TableCell>
                      <TableCell className="align-top">
                        {dateFormatter.format(transaction.date)}
                      </TableCell>
                      <TableCell className="min-w-0 align-top">
                        <button
                          type="button"
                          className="flex w-full min-w-0 items-start gap-2 rounded-md px-1 py-0.5 text-left hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          onClick={() => {
                            openEditNotesDialog(transaction)
                          }}
                        >
                          {transaction.type === "income" ? (
                            <ArrowDownLeftIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                          ) : (
                            <ArrowUpRightIcon className="mt-0.5 size-3.5 shrink-0 text-rose-600" />
                          )}
                          <div className="min-w-0 flex-1">
                            <TruncatedTextWithTooltip
                              text={transaction.description}
                              className="font-medium"
                              instant
                            />
                            {transaction.notes ? (
                              <TruncatedTextWithTooltip
                                text={transaction.notes}
                                className="text-xs text-muted-foreground"
                              />
                            ) : null}
                          </div>
                        </button>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {transaction.category}
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
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={isEditNotesDialogOpen}
        onOpenChange={handleEditNotesDialogOpenChange}
      >
        <DialogContent>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSaveNotes()
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit transaction notes</DialogTitle>
              <DialogDescription>
                {selectedTransaction ? (
                  <span
                    className="block truncate"
                    title={selectedTransaction.description}
                  >
                    {selectedTransaction.description}
                  </span>
                ) : (
                  "Update notes for this transaction."
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <label
                htmlFor="transaction-notes"
                className="text-sm font-medium text-foreground"
              >
                Notes
              </label>
              <textarea
                id="transaction-notes"
                value={notesDraft}
                onChange={(event) => {
                  setNotesDraft(event.target.value)
                }}
                rows={6}
                placeholder="Add context for this transaction"
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSavingNotes}
              />
              {editNotesError ? (
                <p className="text-sm text-destructive">{editNotesError}</p>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleEditNotesDialogOpenChange(false)
                }}
                disabled={isSavingNotes}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingNotes}>
                {isSavingNotes ? "Saving..." : "Save notes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatCurrency(value: number, currency: string) {
  try {
    return Money.fromCurrencyCode({
      amount: value,
      currencyCode: currency,
    }).format()
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

function TruncatedTextWithTooltip({
  text,
  className,
  instant = false,
}: {
  text: string
  className?: string
  instant?: boolean
}) {
  const textRef = useRef<HTMLParagraphElement | null>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = textRef.current

    if (!element) {
      return
    }

    const updateTruncationState = () => {
      const exceedsWidth = element.scrollWidth - element.clientWidth > 1
      const exceedsHeight = element.scrollHeight - element.clientHeight > 1
      setIsTruncated(exceedsWidth || exceedsHeight)
    }

    const animationFrame = window.requestAnimationFrame(updateTruncationState)

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateTruncationState)

      return () => {
        window.cancelAnimationFrame(animationFrame)
        window.removeEventListener("resize", updateTruncationState)
      }
    }

    const resizeObserver = new ResizeObserver(updateTruncationState)
    resizeObserver.observe(element)

    const parentElement = element.parentElement
    if (parentElement) {
      resizeObserver.observe(parentElement)
    }

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
    }
  }, [text])

  return (
    <Tooltip delayDuration={instant ? 0 : undefined}>
      <TooltipTrigger asChild>
        <p
          ref={textRef}
          title={isTruncated ? text : undefined}
          className={`block w-full truncate ${className ?? ""}`.trim()}
        >
          {text}
        </p>
      </TooltipTrigger>
      {isTruncated ? (
        <TooltipContent
          className={`max-w-sm break-words ${
            instant
              ? "transition-none data-[state=delayed-open]:animate-none data-open:animate-none data-closed:animate-none"
              : ""
          }`.trim()}
        >
          {text}
        </TooltipContent>
      ) : null}
    </Tooltip>
  )
}
