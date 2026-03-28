import { useMemo, useState } from "react"
import { useCategories } from "@guallet/api-react"
import { CheckIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type CategoryPickerMode = "single" | "multiple"

type CategoryPickerDialogBaseProps = {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  title?: string
  description?: string
  searchPlaceholder?: string
}

type SingleCategoryPickerDialogProps = CategoryPickerDialogBaseProps & {
  mode?: "single"
  selectedCategoryId?: string | null
  onCategorySelected: (categoryId: string) => void
}

type MultipleCategoryPickerDialogProps = CategoryPickerDialogBaseProps & {
  mode: "multiple"
  selectedCategoryIds?: string[]
  onCategorySelected: (categoryIds: string[]) => void
}

type CategoryPickerDialogProps =
  | SingleCategoryPickerDialogProps
  | MultipleCategoryPickerDialogProps

export function CategoryPickerDialog(
  props: Readonly<CategoryPickerDialogProps>
) {
  const { categories, isLoading } = useCategories()

  const [query, setQuery] = useState("")
  const [draftSelectionOverride, setDraftSelectionOverride] = useState<
    string[] | null
  >(null)

  const mode: CategoryPickerMode = props.mode ?? "single"
  const isMultiple = mode === "multiple"

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name))
  }, [categories])

  const allCategoryIds = useMemo(() => {
    return sortedCategories.map((category) => category.id)
  }, [sortedCategories])

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return sortedCategories
    }

    return sortedCategories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery)
    )
  }, [query, sortedCategories])

  const selectedCategoryIdsFromProps =
    props.mode === "multiple"
      ? [...new Set(props.selectedCategoryIds ?? [])]
      : []

  const draftSelectedCategoryIds =
    draftSelectionOverride ?? selectedCategoryIdsFromProps

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuery("")
      setDraftSelectionOverride(null)
    }

    props.onOpenChange(isOpen)
  }

  const toggleCategorySelection = (categoryId: string) => {
    setDraftSelectionOverride((currentSelectionOverride) => {
      const currentSelection =
        currentSelectionOverride ?? selectedCategoryIdsFromProps

      if (currentSelection.includes(categoryId)) {
        return currentSelection.filter((id) => id !== categoryId)
      }

      return [...currentSelection, categoryId]
    })
  }

  const handleSingleSelect = (categoryId: string) => {
    if (props.mode === "multiple") {
      return
    }

    props.onCategorySelected(categoryId)
    handleDialogOpenChange(false)
  }

  const handleSelectAll = () => {
    setDraftSelectionOverride(allCategoryIds)
  }

  const handleClearAll = () => {
    setDraftSelectionOverride([])
  }

  const handleMultipleSelect = () => {
    if (props.mode !== "multiple") {
      return
    }

    const selectedCategories = sortedCategories
      .filter((category) => draftSelectedCategoryIds.includes(category.id))
      .map((category) => category.id)

    props.onCategorySelected(selectedCategories)
    handleDialogOpenChange(false)
  }

  const dialogTitle = props.title ?? "Pick category"
  const dialogDescription =
    props.description ??
    (isMultiple
      ? "Select one or more categories from the list."
      : "Choose a category from the list.")

  return (
    <Dialog open={props.open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
              }}
              placeholder={props.searchPlaceholder ?? "Search categories"}
              className="pl-8"
            />
          </label>

          {isMultiple ? (
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                disabled={allCategoryIds.length === 0}
              >
                Select all
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                disabled={draftSelectedCategoryIds.length === 0}
              >
                Clear all
              </Button>
            </div>
          ) : null}

          <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
            {isLoading ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                Loading categories...
              </p>
            ) : null}

            {!isLoading && filteredCategories.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                No categories found.
              </p>
            ) : null}

            {isLoading
              ? null
              : filteredCategories.map((category) => {
                  const isSelected = isMultiple
                    ? draftSelectedCategoryIds.includes(category.id)
                    : props.mode !== "multiple" &&
                      props.selectedCategoryId === category.id

                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isSelected ? "bg-muted/40" : undefined
                      )}
                      onClick={() => {
                        if (isMultiple) {
                          toggleCategorySelection(category.id)
                        } else {
                          handleSingleSelect(category.id)
                        }
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{category.name}</p>
                      </div>
                      {isSelected ? (
                        <CheckIcon className="size-4 shrink-0 text-primary" />
                      ) : (
                        <span className="size-4 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
          </div>
        </div>

        {isMultiple ? (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleDialogOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleMultipleSelect}>
              Select
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
