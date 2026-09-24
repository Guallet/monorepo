# Sanitized Nordigen output

Created inside the separate output copy. The source and its copied country exports remain unchanged.

- Source rows across country files: 2904
- Consolidated institution records: 2364
- Unique local logo byte hashes: 898
- Country-scoped unique image files: 1559

`institutions.json` groups visual duplicates by SHA-256. Each institution object retains its source country folders in `countries`; the original provider `countries` metadata is kept as `provider_countries`. Different institution records that share a generic logo remain separate under that logo group.

`institutions.sql` contains one upsert per source institution ID, with the country-folder memberships written to `countries`. Images are stored once per hash within each country folder under `images/<country>/`.
