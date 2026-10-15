# Nordigen institution backup

This standalone script downloads institution data and logo images from the
GoCardless Bank Account Data API (formerly Nordigen) for every country currently
supported by Guallet. It does not connect to the Guallet API or database.

## Requirements

- Node.js 24 or newer
- Nordigen / GoCardless Bank Account Data client ID and secret
- An interactive terminal

## Run

From the repository root:

```sh
node scripts/nordigen-importer/import.mjs
```

Enter the client ID when prompted. The client secret is masked while typing.
Credentials and access tokens are only held in memory for the run.

## Output

The script creates one directory per supported country under
`scripts/nordigen-importer/output/`:

```text
output/
  GB/
    institutions.json
    institutions.sql
    images/
      institution-id.png
  FR/
    institutions.json
    institutions.sql
    images/
      institution-id.svg
```

- `institutions.json` contains the country’s institution records as returned by
  the API.
- `institutions.sql` contains PostgreSQL `INSERT ... ON CONFLICT` statements
  for the Guallet `institutions` table. It keeps the remote logo URL in
  `image_src`; the downloaded image files are a separate local backup.
- `images/` contains the original downloaded image bytes. The filename
  extension is taken from the image content type, or from the URL when the
  content type is unavailable or unknown. Unknown formats use `.bin`; image
  content is never converted.

Repeated institution IDs may occur in different country folders. The SQL
statements use `nordigen_id` as the conflict key, so importing multiple country
scripts does not create duplicate institution rows.

Generated output is ignored by Git. Move or copy it elsewhere if you want to
retain a particular backup outside this checkout.

## Failures

The script continues to the next country after a country request fails, and
continues to other images if an individual image cannot be downloaded. It
reports the failures at the end and exits with a nonzero status. Data and SQL
files are still saved when only image downloads fail. A token request failure
stops the run.

The country list is copied from
`apps/api/src/features/openbanking/sync.service.ts`; update the script’s list
there if Guallet’s supported countries change.
