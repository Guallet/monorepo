import { Button } from '@/components/ui/button';
import { useNavigate, Navigate } from '@tanstack/react-router';
import {
  useCategoriesMappings,
  useCsvCategories,
  useCsvActions,
} from '../state/csvState';
import { useCategories } from '@guallet/api-react';
import { CsvStepper } from '../components/CsvStepper';

export function CsvCategoriesScreen() {
  const navigate = useNavigate();

  const { categories: remoteCategories } = useCategories();
  const csvCategories = useCsvCategories();
  const mappings = useCategoriesMappings();
  const { setCategoriesMappings } = useCsvActions();

  // If there are no categories values, just skip this step as we don't need to map anything
  // They will be left as "untagged"
  if (csvCategories.length === 0) {
    return <Navigate to="/importer/csv/summary" />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Map Categories
        </h1>
        <p className="text-sm text-muted-foreground">
          Map your CSV categories to existing categories or leave untagged.
        </p>
      </div>

      <CsvStepper
        size="sm"
        activeStep={3}
        onStepClick={(stepIndex) => {
          switch (stepIndex) {
            case 0:
              navigate({
                to: '/importer/csv',
              });
              break;
            case 1:
              navigate({
                to: '/importer/csv/properties',
              });
              break;
            case 2:
              navigate({
                to: '/importer/csv/accounts',
              });
              break;
            default:
              break;
          }
        }}
      />

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-semibold">Category Mappings</p>
          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {csvCategories.length}{' '}
            {csvCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="border px-3 py-2 text-left font-semibold">
                  CSV Category
                </th>
                <th className="border px-3 py-2 text-left font-semibold">
                  Map to Category
                </th>
              </tr>
            </thead>
            <tbody>
              {csvCategories.map((categoryName) => {
                const mappedCategoryId = mappings[categoryName]?.id ?? '';

                return (
                  <tr key={categoryName}>
                    <td className="border px-3 py-2">
                      <p className="font-semibold">{categoryName}</p>
                    </td>
                    <td className="border px-3 py-2">
                      <select
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={mappedCategoryId}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setCategoriesMappings({
                            ...mappings,
                            [categoryName]: remoteCategories.find(
                              (category) => category.id === value,
                            ),
                          });
                        }}
                      >
                        <option value="">Leave untagged</option>
                        {remoteCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Tip: Leave categories untagged if you want to categorize them later
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            navigate({
              to: '/importer/csv/accounts',
            });
          }}
        >
          Back
        </Button>
        <Button
          onClick={() => {
            navigate({
              to: '/importer/csv/summary',
            });
          }}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
