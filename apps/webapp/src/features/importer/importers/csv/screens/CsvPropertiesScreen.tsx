import { Button } from '@/components/ui/button';
import { FieldMappings } from '../models';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  useCsvInfo,
  useCsvFields,
  useCsvMappings,
  useCsvActions,
} from '../state/csvState';
import { IconAlertCircle, IconExclamationCircle } from '@tabler/icons-react';
import { isDate } from '@/utils/dateUtils';
import { isValidNumber } from '@/utils/numberUtils';
import { CsvStepper } from '../components/CsvStepper';

const SAMPLE_ARRAY_SIZE = 10;
const EMPTY_MAP_FIELD_VALUE = "Don't map";

export function CsvPropertiesScreen() {
  const navigate = useNavigate();

  const csvData = useCsvInfo();
  const csvFields = useCsvFields();
  const availableFields = [EMPTY_MAP_FIELD_VALUE, ...csvFields];
  const mappings = useCsvMappings();
  const { setCsvMappings } = useCsvActions();

  const sampleData = csvData.data.slice(0, SAMPLE_ARRAY_SIZE);

  const [isValidDateField, setIsValidDateField] = useState(true);
  const [isValidAmountField, setIsValidAmountField] = useState(true);
  const hasInvalidDateField = isValidDateField === false;
  const hasInvalidAmountField = isValidAmountField === false;

  const canContinue =
    mappings.date !== '' &&
    mappings.amount !== '' &&
    mappings.description !== '' &&
    isValidDateField &&
    isValidAmountField;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Map CSV Fields</h1>
        <p className="text-sm text-muted-foreground">
            Match your CSV columns to transaction fields. Required fields are
            marked with *.
        </p>
      </div>

      <CsvStepper
        activeStep={1}
        onStepClick={(stepIndex) => {
          if (stepIndex === 0) {
            navigate({
              to: '/importer/csv',
            });
          }
        }}
      />

      {hasInvalidDateField || hasInvalidAmountField ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <IconAlertCircle className="h-4 w-4" />
            Validation Issues
          </div>
          <ul className="space-y-1 text-sm">
            {hasInvalidDateField ? (
              <li className="flex items-start gap-2">
                <IconExclamationCircle className="mt-0.5 h-4 w-4" />
                <span>
                  The selected DATE field doesn't follow a valid date pattern
                </span>
              </li>
            ) : null}
            {hasInvalidAmountField ? (
              <li className="flex items-start gap-2">
                <IconExclamationCircle className="mt-0.5 h-4 w-4" />
                <span>The selected AMOUNT field is not a number</span>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-semibold">Field Mappings</p>
          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {csvData.data.length} transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="border px-3 py-2 text-left font-semibold">
                    Account{' '}
                    <span className="text-red-600">
                      *
                    </span>
                </th>
                <th className="border px-3 py-2 text-left font-semibold">
                    Date{' '}
                    <span className="text-red-600">
                      *
                    </span>
                </th>
                <th className="border px-3 py-2 text-left font-semibold">
                    Amount{' '}
                    <span className="text-red-600">
                      *
                    </span>
                </th>
                <th className="border px-3 py-2 text-left font-semibold">
                    Description{' '}
                    <span className="text-red-600">
                      *
                    </span>
                </th>
                <th className="border px-3 py-2 text-left font-semibold">Notes</th>
                <th className="border px-3 py-2 text-left font-semibold">Category</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-2">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={mappings.account || EMPTY_MAP_FIELD_VALUE}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      const fieldValue =
                        value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                      setCsvMappings({
                        ...mappings,
                        account: fieldValue,
                      });
                    }}
                  >
                    {availableFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-2">
                  <select
                    className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                      isValidDateField ? 'border-input' : 'border-red-400'
                    }`}
                    value={mappings.date || EMPTY_MAP_FIELD_VALUE}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      const fieldValue =
                        value === EMPTY_MAP_FIELD_VALUE ? '' : value;

                      setCsvMappings({
                        ...mappings,
                        date: fieldValue,
                      });

                      const testDates = sampleData.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (item: any) => item[fieldValue || ''],
                      );
                      const isValid =
                        fieldValue === '' ||
                        testDates.every((input) => isDate(input));
                      setIsValidDateField(isValid);
                    }}
                  >
                    {availableFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-2">
                  <select
                    className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                      isValidAmountField ? 'border-input' : 'border-red-400'
                    }`}
                    value={mappings.amount || EMPTY_MAP_FIELD_VALUE}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      const fieldValue =
                        value === EMPTY_MAP_FIELD_VALUE ? '' : value;

                      setCsvMappings({
                        ...mappings,
                        amount: fieldValue,
                      });

                      const testAmounts = sampleData.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (item: any) => item[fieldValue || ''],
                      );
                      const isValid =
                        fieldValue === '' ||
                        testAmounts.every((input) => isValidNumber(input));
                      setIsValidAmountField(isValid);
                    }}
                  >
                    {availableFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-2">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={mappings.description || EMPTY_MAP_FIELD_VALUE}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      const fieldValue =
                        value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                      setCsvMappings({
                        ...mappings,
                        description: fieldValue,
                      });
                    }}
                  >
                    {availableFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-2">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={mappings.notes || EMPTY_MAP_FIELD_VALUE}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      const fieldValue =
                        value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                      setCsvMappings({
                        ...mappings,
                        notes: fieldValue,
                      });
                    }}
                  >
                    {availableFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-2">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={mappings.category || EMPTY_MAP_FIELD_VALUE}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      const fieldValue =
                        value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                      setCsvMappings({
                        ...mappings,
                        category: fieldValue,
                      });
                    }}
                  >
                    {availableFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {sampleData.map((row, index) => (
                <RowElement
                  key={`${index}-${String(row[mappings.date])}-${String(row[mappings.amount])}`}
                  mappings={mappings}
                  element={row}
                />
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
              Preview showing {Math.min(SAMPLE_ARRAY_SIZE, csvData.data.length)}{' '}
              of {csvData.data.length} transactions
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            navigate({
              to: '/importer/csv/accounts',
            });
          }}
          disabled={!canContinue}
        >
          Continue to Accounts
        </Button>
      </div>
    </div>
  );
}

interface RowElementProps {
  mappings: FieldMappings;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any;
}
function RowElement({ mappings, element }: Readonly<RowElementProps>) {
  return (
    <tr>
      <td className="border px-3 py-2">{element[mappings.account] || '-'}</td>
      <td className="border px-3 py-2">{element[mappings.date] || '-'}</td>
      <td className="border px-3 py-2">{element[mappings.amount] || '-'}</td>
      <td className="border px-3 py-2">{element[mappings.description] || '-'}</td>
      <td className="border px-3 py-2">{element[mappings.notes] || '-'}</td>
      <td className="border px-3 py-2">{element[mappings.category] || '-'}</td>
    </tr>
  );
}
