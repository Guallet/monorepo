---
name: add-api-client-domain
description: Add a new domain to guallet-api-client (models + API class) and create TanStack Query hooks in guallet-api-react. Use whenever a new API feature needs to be consumed from the webapp or mobile app. Always do this after create-api-feature.
---

# add-api-client-domain

Adds a new domain to two packages in one go — always done together:

1. **`packages/guallet-api-client`** – TypeScript types + fetch wrapper class
2. **`packages/guallet-api-react`** – TanStack Query hooks

> **Placeholders:** Replace `{Domain}` with PascalCase (e.g. `Budget`), `{domain}` with camelCase (e.g. `budget`), `{domain-kebab}` with kebab-case (e.g. `budget`), `{domains}` with plural camelCase (e.g. `budgets`), `{DOMAIN}` with SCREAMING_SNAKE (e.g. `BUDGETS`).

---

## Part A — `guallet-api-client`

### Files to Create

```
packages/guallet-api-client/src/{domain-kebab}/
  {domain-kebab}.models.ts
  {domain-kebab}.api.ts
  index.ts
```

### Files to Update

- `packages/guallet-api-client/src/GualletClient.ts`
- `packages/guallet-api-client/src/index.ts`

---

### A1. Models – `{domain-kebab}.models.ts`

Types only — no classes, no runtime code.

```typescript
export type {Domain}Dto = {
  id: string;
  name: string;
  // Mirror the fields returned by {Name}Dto.fromDomain() in the API.
  // Include all fields the UI needs; omit internal fields (user_id, deleted_at).
  createdAt: string;
  updatedAt: string;
};

export type Create{Domain}Request = {
  name: string;
  // All required fields for creation.
  // Optional fields:  fieldName?: type;
};

export type Update{Domain}Request = {
  name?: string;
  // All updatable fields (all optional — partial update).
};
```

---

### A2. API Class – `{domain-kebab}.api.ts`

```typescript
import { GualletClientImpl } from '../GualletClient';
import {
  {Domain}Dto,
  Create{Domain}Request,
  Update{Domain}Request,
} from './{domain-kebab}.models';

const {DOMAIN}_PATH = '{domains}';

export class {Domain}Api {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<{Domain}Dto[]> {
    return await this.client.get<{Domain}Dto[]>({ path: {DOMAIN}_PATH });
  }

  async get(id: string): Promise<{Domain}Dto> {
    return await this.client.get<{Domain}Dto>({ path: `${{{DOMAIN}_PATH}}/${id}` });
  }

  async create(request: Create{Domain}Request): Promise<{Domain}Dto> {
    return await this.client.post<{Domain}Dto, Create{Domain}Request>({
      path: {DOMAIN}_PATH,
      payload: request,
    });
  }

  async update(id: string, request: Update{Domain}Request): Promise<{Domain}Dto> {
    return await this.client.patch<{Domain}Dto, Update{Domain}Request>({
      path: `${{{DOMAIN}_PATH}}/${id}`,
      payload: request,
    });
  }

  async delete(id: string): Promise<void> {
    return await this.client.fetch_delete({ path: `${{{DOMAIN}_PATH}}/${id}` });
  }
}
```

> Note: the API uses `PATCH` for partial updates. Use `PUT` only if the server endpoint requires it.

---

### A3. Index – `index.ts`

```typescript
export * from './{domain-kebab}.models';
export * from './{domain-kebab}.api';
```

---

### A4. Register in `GualletClient.ts`

Add in three places:

```typescript
// 1. Import at the top
import { {Domain}Api } from './{domain-kebab}';

// 2. Add to the GualletClient interface
export interface GualletClient {
  // ...existing...
  {domain}: {Domain}Api;
}

// 3. Add to GualletClientImpl class declaration
export class GualletClientImpl implements GualletClient {
  // ...existing...
  {domain}: {Domain}Api;

  constructor(...) {
    // ...existing...
    this.{domain} = new {Domain}Api(this);
  }
}
```

---

### A5. Export from `packages/guallet-api-client/src/index.ts`

```typescript
export * from './{domain-kebab}';
```

---

## Part B — `guallet-api-react`

### Files to Create

```
packages/guallet-api-react/src/{domain-kebab}/
  use{Domain}.tsx
  use{Domain}Mutations.tsx
  index.ts
```

### File to Update

`packages/guallet-api-react/src/index.ts`

---

### B1. Query Hooks – `use{Domain}.tsx`

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';
import { {Domain}Dto } from '@guallet/api-client';

const {DOMAIN}_QUERY_KEY = '{domains}';

export function use{Domain}s() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [{DOMAIN}_QUERY_KEY],
    queryFn: async () => {
      const items = await gualletClient.{domain}.getAll();
      // Populate individual-item cache so detail hooks resolve instantly.
      items.forEach((item) => {
        queryClient.setQueryData([{DOMAIN}_QUERY_KEY, item.id], item);
      });
      return items;
    },
  });

  return {
    {domains}: query.data?.filter((dto): dto is {Domain}Dto => dto !== undefined) ?? [],
    ...query,
  };
}

export function use{Domain}(id?: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [{DOMAIN}_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.{domain}.get(id!);
    },
    enabled: !!id,
  });

  return {
    {domain}: query.data ?? null,
    ...query,
  };
}
```

---

### B2. Mutation Hooks – `use{Domain}Mutations.tsx`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';
import { Create{Domain}Request, Update{Domain}Request } from '@guallet/api-client';

const {DOMAIN}_QUERY_KEY = '{domains}';

export function use{Domain}Mutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const create{Domain}Mutation = useMutation({
    mutationFn: async ({ request }: { request: Create{Domain}Request }) => {
      return await gualletClient.{domain}.create(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [{DOMAIN}_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Failed to create {domain}:', error);
    },
  });

  const update{Domain}Mutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: Update{Domain}Request;
    }) => {
      return await gualletClient.{domain}.update(id, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [{DOMAIN}_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Failed to update {domain}:', error);
    },
  });

  const delete{Domain}Mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.{domain}.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [{DOMAIN}_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Failed to delete {domain}:', error);
    },
  });

  return {
    create{Domain}Mutation,
    update{Domain}Mutation,
    delete{Domain}Mutation,
  };
}
```

---

### B3. Index – `index.ts`

```typescript
export * from './use{Domain}';
export * from './use{Domain}Mutations';
```

---

### B4. Export from `packages/guallet-api-react/src/index.ts`

```typescript
export * from './{domain-kebab}';
```

---

## Checklist

- [ ] Models file: types only (no classes), mirrors `fromDomain()` output
- [ ] API class: path constant at top, uses `this.client.get/post/patch/fetch_delete`
- [ ] `GualletClient.ts`: interface + class property + constructor instantiation updated
- [ ] `guallet-api-client/src/index.ts`: new `export *` line added
- [ ] Query hook: constant key, `enabled: !!id` on detail hook
- [ ] Mutations hook: `invalidateQueries` in every `onSuccess`
- [ ] `guallet-api-react/src/index.ts`: new `export *` line added
