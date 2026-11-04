# Guallet API - Bruno collection

A [Bruno](https://www.usebruno.com/) collection for exploring the Guallet API
by hand. Bruno stores requests as plain text files, so the collection lives in
git next to the API it documents.

## Use it

1. Start the API locally (`pnpm --filter api dev`, listens on port 5000).
2. Open this folder (`apps/api/bruno`) as a collection in Bruno.
3. Select the **Local** environment.
4. Sign in from the **Auth** folder: run **Send sign-in OTP**, then **Sign in
   with OTP** with the code from the email. Bruno stores the session cookie in
   its cookie jar and sends it with every other request.
5. Run any other request. Create account returns an id you can paste into the
   `accountId` environment variable for the requests that need one.

See `docs/bruno-collection.md` for why the collection is structured this way
and how it stays aligned with the OpenAPI contract.
