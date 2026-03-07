import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { CSV_MIME_TYPE } from '../models';
import {
  IconFileTypeCsv,
  IconUpload,
  IconX,
  IconCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import Papa from 'papaparse';
import { CsvStepper } from '../components/CsvStepper';
import { useCsvActions } from '../state/csvState';

export function CsvImporterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reset, setCsvInfo } = useCsvActions();
  const navigate = useNavigate();

  async function readFile(file: FileWithPath) {
    try {
      setIsLoading(true);
      setError(null);
      reset();
      const fileContent = await file.text();
      const { data, errors, meta } = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      if (errors.length > 0) {
        setError(`CSV parsing errors: ${errors[0].message}`);
        return;
      }

      if (!meta.fields || meta.fields.length === 0) {
        setError('CSV file appears to be empty or has no headers');
        return;
      }

      setCsvInfo({
        data: data,
        properties: meta.fields ?? [],
      });

      navigate({
        to: '/importer/csv/properties',
      });
    } catch (e) {
      console.error("It's not possible to read the file", e);
      setError(
        "Failed to read the CSV file. Please ensure it's a valid CSV format.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Import CSV File
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload your transaction data in CSV format. We'll help you map the
          fields and import everything automatically.
        </p>
        <CsvStepper activeStep={0} />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <IconInfoCircle className="h-4 w-4" />
                Error
              </div>
              <p className="text-sm">{error}</p>
            </div>
            <button
              type="button"
              className="text-xs underline"
              onClick={() => {
                setError(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <Dropzone
          onDrop={(files) => {
            readFile(files[0]);
          }}
          onReject={(files) => {
            const rejection = files[0];
            if (rejection.errors[0]?.code === 'file-too-large') {
              setError('File is too large. Maximum size is 5MB.');
            } else if (rejection.errors[0]?.code === 'file-invalid-type') {
              setError('Invalid file type. Please upload a CSV file.');
            }
          }}
          maxSize={5 * 1024 ** 2}
          accept={[CSV_MIME_TYPE]}
          maxFiles={1}
          multiple={false}
          loading={isLoading}
        >
          <div className="pointer-events-none flex min-h-[220px] items-center justify-center gap-8">
            <Dropzone.Accept>
              <IconUpload
                style={{
                  width: 52,
                  height: 52,
                  color: '#2563eb',
                }}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                style={{
                  width: 52,
                  height: 52,
                  color: '#dc2626',
                }}
                stroke={1.5}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFileTypeCsv
                style={{
                  width: 52,
                  height: 52,
                  color: '#6b7280',
                }}
                stroke={1.5}
              />
            </Dropzone.Idle>

            <div>
              <p className="text-lg font-medium">
                Drag CSV file here or click to select
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                File should not exceed 5MB
              </p>
            </div>
          </div>
        </Dropzone>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-semibold">CSV Requirements:</p>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <IconCheck className="h-3 w-3" />
              </span>
              <span>First row should contain column headers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <IconCheck className="h-3 w-3" />
              </span>
              <span>Must include date and amount columns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <IconCheck className="h-3 w-3" />
              </span>
              <span>Supported formats: .csv files only</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <IconCheck className="h-3 w-3" />
              </span>
              <span>Maximum file size: 5MB</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
