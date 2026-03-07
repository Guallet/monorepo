import { InstitutionDto } from '@guallet/api-client';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InstitutionsTableProps {
  institutions: InstitutionDto[];
}

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export default function InstitutionsTable({
  institutions,
}: Readonly<InstitutionsTableProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [userInstitutionFilter, setUserInstitutionFilter] = useState<
    'user' | 'system' | 'all'
  >('all');

  const filteredInstitutions = useMemo(() => {
    let results = institutions;

    if (searchTerm) {
      results = results.filter((institution) =>
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (countryFilter) {
      results = results.filter((institution) =>
        institution.countries.includes(countryFilter),
      );
    }

    if (userInstitutionFilter === 'user') {
      results = results.filter((institution) => institution.user_id !== null);
    } else if (userInstitutionFilter === 'system') {
      results = results.filter((institution) => institution.user_id === null);
    }

    return results;
  }, [institutions, searchTerm, countryFilter, userInstitutionFilter]);

  const countries = useMemo(
    () =>
      Array.from(
        new Set(institutions.flatMap((institution) => institution.countries)),
      ).sort((a, b) => a.localeCompare(b)),
    [institutions],
  );

  const hasResults = filteredInstitutions.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1 space-y-2">
          <Label htmlFor="institutions-search">Search by name</Label>
          <Input
            id="institutions-search"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="min-w-[180px] space-y-2">
          <Label htmlFor="institutions-country-filter">Country</Label>
          <select
            id="institutions-country-filter"
            className={selectClassName}
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[220px] space-y-2">
          <Label htmlFor="institutions-type-filter">Type</Label>
          <select
            id="institutions-type-filter"
            className={selectClassName}
            value={userInstitutionFilter}
            onChange={(event) =>
              setUserInstitutionFilter(
                event.target.value as 'user' | 'system' | 'all',
              )
            }
          >
            <option value="all">All Institutions</option>
            <option value="user">User Institutions</option>
            <option value="system">System Institutions</option>
          </select>
        </div>

        <Button type="button">Create New Institution</Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/60 text-left">
              <th className="px-3 py-2">Logo</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Countries</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hasResults ? (
              filteredInstitutions.map((institution) => (
                <tr key={institution.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">
                    <img
                      src={institution.image_src}
                      alt={institution.name}
                      width={50}
                      height={50}
                      className="h-10 w-10 rounded object-contain"
                    />
                  </td>
                  <td className="px-3 py-2">{institution.name}</td>
                  <td className="px-3 py-2">
                    {institution.countries.join(', ')}
                  </td>
                  <td className="px-3 py-2">
                    {institution.user_id ? (
                      <div className="flex items-center gap-2">
                        <Button type="button" size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        System institution
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  No institutions match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
