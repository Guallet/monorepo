---
name: create-api-feature
description: Scaffold a complete NestJS feature module in apps/api following the Guallet pattern: entity, DTOs, service, controller, module, and registration in AppModule. Use when adding a new backend domain resource.
---

# create-api-feature

Creates all files for a new feature under `apps/api/src/features/{name}/` and registers it in `AppModule`.

> **Placeholders:** Replace `{Name}` with PascalCase (e.g. `Budget`), `{name}` with kebab-case (e.g. `budget`), `{names}` with plural kebab-case (e.g. `budgets`).

## Files to Create

```
apps/api/src/features/{name}/
  entities/{name}.entity.ts
  dto/create-{name}.dto.ts
  dto/update-{name}.dto.ts
  dto/{name}.dto.ts
  {name}.service.ts
  {name}.controller.ts
  {name}.module.ts
```

## File to Update

`apps/api/src/app.module.ts` – add import and add to the `// APP MODULES` list.

---

## 1. Entity – `entities/{name}.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';

@Entity('{names}')
export class {Name} extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'text' })
  name: string;

  // Add domain-specific columns here.
  // Examples:
  //   @Column({ type: 'decimal' })         amount: number;
  //   @Column({ type: 'text', nullable: true }) notes: string;
  //   @Column({ type: 'jsonb', nullable: true }) metadata: MyMetadata | null;
  //   @Column({ type: 'enum', enum: MyEnum, default: MyEnum.UNKNOWN }) status: MyEnum;
  //   @Column({ nullable: true }) relatedEntityId: string | null;
}
```

**Column rules:**

- Use snake_case for column names matching the DB (`user_id`, `created_at`).
- Money/prices: `type: 'decimal'`.
- Free-form text: `type: 'text'`.
- Flexible data: `type: 'jsonb', nullable: true`.
- Enums: `type: 'enum', enum: MyEnum, default: MyEnum.DEFAULT`.
- All entities inherit `created_at`, `updated_at`, `deleted_at` from `BaseDbEntity`.

---

## 2. Request DTOs

The API Swagger CLI plugin is disabled. Every DTO property must be decorated explicitly; TypeScript types, comments, and inferred return types do not populate OpenAPI schemas.

### `dto/create-{name}.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class Create{Name}Dto {
  @ApiProperty({ description: 'The name of the {name}' })
  name: string;

  // Add other create fields here, e.g.:
  // @ApiProperty({ required: false, description: '...', nullable: true })
  // notes?: string;

  constructor(props: Create{Name}Dto) {
    Object.assign(this, props);
  }
}
```

### `dto/update-{name}.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class Update{Name}Dto {
  @ApiProperty({ required: false, description: 'The name of the {name}', nullable: true })
  name?: string;

  // Add other updatable fields here (all optional).

  constructor(props: Update{Name}Dto) {
    Object.assign(this, props);
  }
}
```

---

## 3. Response DTO – `dto/{name}.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { {Name} } from '../entities/{name}.entity';

export class {Name}Dto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  // Mirror all fields from the entity that the client needs. Decorate every
  // field. Use type: [String]/type: [OtherDto] for arrays, type: () => Dto
  // for nested DTOs, type: String + format: date-time for dates, enum for
  // enums, and type: Object/schema for maps or interfaces.

  static fromDomain(domain: {Name}): {Name}Dto {
    return {
      id: domain.id,
      name: domain.name,
      // Map all fields. Rename as needed:
      //   createdAt: domain.created_at,
    };
  }
}
```

**Rules for `fromDomain`:**

- Map DB snake_case to camelCase for JSON responses.
- Flatten relations (e.g. `institutionId: domain.institution?.id ?? null`).
- Never expose internal fields (`user_id`, `deleted_at`).

---

## 4. Service – `{name}.service.ts`

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {Name} } from './entities/{name}.entity';
import { Create{Name}Dto } from './dto/create-{name}.dto';
import { Update{Name}Dto } from './dto/update-{name}.dto';

@Injectable()
export class {Name}Service {
  private readonly logger = new Logger({Name}Service.name);

  constructor(
    @InjectRepository({Name})
    private readonly repository: Repository<{Name}>,
  ) {}

  async findAllForUser(userId: string): Promise<{Name}[]> {
    this.logger.debug(`Getting {names} for user ${userId}`);
    return await this.repository.find({
      where: { user_id: userId },
    });
  }

  async findOneForUser({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<{Name}> {
    const entity = await this.repository.findOne({
      where: { id, user_id: userId },
    });
    if (!entity) {
      throw new NotFoundException();
    }
    return entity;
  }

  async create({
    userId,
    dto,
  }: {
    userId: string;
    dto: Create{Name}Dto;
  }): Promise<{Name}> {
    return await this.repository.save({
      user_id: userId,
      name: dto.name,
      // Map other create fields here.
    });
  }

  async update({
    id,
    userId,
    dto,
  }: {
    id: string;
    userId: string;
    dto: Update{Name}Dto;
  }): Promise<{Name}> {
    const entity = await this.findOneForUser({ id, userId });
    return await this.repository.save({
      ...entity,
      name: dto.name ?? entity.name,
      // Merge other updatable fields: dto.field ?? entity.field
    });
  }

  async remove({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<{Name}> {
    const entity = await this.findOneForUser({ id, userId });
    await this.repository.remove(entity);
    return entity;
  }
}
```

**Service rules:**

- All methods take an object argument `{ id, userId, dto }` – never positional parameters.
- Always scope queries with `user_id: userId`.
- Throw `NotFoundException` when the entity is missing or doesn't belong to the user.
- Throw `BadRequestException` for invalid business logic (import from `@nestjs/common`).
- Log at `debug` level for normal operations; `error` for unexpected failures.

---

## 5. Controller – `{name}.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common';
import { RequestUser } from 'src/auth/decorators/request-user.decorator';
import { UserPrincipal } from 'src/auth/models/user-principal.model';
import { {Name}Service } from './{name}.service';
import { Create{Name}Dto } from './dto/create-{name}.dto';
import { Update{Name}Dto } from './dto/update-{name}.dto';
import { {Name}Dto } from './dto/{name}.dto';

@ApiTags('{Names}')
@Controller('{names}')
export class {Name}Controller {
  private readonly logger = new Logger({Name}Controller.name);

  constructor(private readonly {name}Service: {Name}Service) {}

  @Get()
  @ApiOperation({ summary: 'List {names}' })
  @ApiResponse({ status: 200, type: [{Name}Dto] })
  async findAll(
    @RequestUser() user: UserPrincipal,
  ): Promise<{Name}Dto[]> {
    const entities = await this.{name}Service.findAllForUser(user.id);
    return entities.map((e) => {Name}Dto.fromDomain(e));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a {name} by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: '{Name} ID' })
  @ApiResponse({ status: 200, type: {Name}Dto })
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{Name}Dto> {
    const entity = await this.{name}Service.findOneForUser({ id, userId: user.id });
    return {Name}Dto.fromDomain(entity);
  }

  @Post()
  @ApiOperation({ summary: 'Create a {name}' })
  @ApiBody({ type: Create{Name}Dto })
  @ApiResponse({ status: 201, type: {Name}Dto })
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: Create{Name}Dto,
  ): Promise<{Name}Dto> {
    const entity = await this.{name}Service.create({ userId: user.id, dto });
    return {Name}Dto.fromDomain(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a {name}' })
  @ApiParam({ name: 'id', format: 'uuid', description: '{Name} ID' })
  @ApiBody({ type: Update{Name}Dto })
  @ApiResponse({ status: 200, type: {Name}Dto })
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Update{Name}Dto,
  ): Promise<{Name}Dto> {
    const entity = await this.{name}Service.update({ id, userId: user.id, dto });
    return {Name}Dto.fromDomain(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a {name}' })
  @ApiParam({ name: 'id', format: 'uuid', description: '{Name} ID' })
  @ApiResponse({ status: 200, type: {Name}Dto })
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{Name}Dto> {
    const entity = await this.{name}Service.remove({ id, userId: user.id });
    return {Name}Dto.fromDomain(entity);
  }
}
```

**Controller rules:**

- Always add `@ApiTags` for Swagger grouping.
- Every route must have `@ApiOperation` and an explicit success response decorator with the actual response DTO or schema.
- Add `@ApiBody` for request DTOs, `@ApiParam` for route parameters, and `@ApiQuery` for query parameters. Use explicit schemas for generic, interface, union, and stream responses.
- Register referenced polymorphic DTOs with `@ApiExtraModels` and use `oneOf`/`allOf` with `getSchemaPath`.
- Always use `@RequestUser()` to get the current user – never read from the request object directly.
- Always use `ParseUUIDPipe` on `:id` route params.
- Return response DTOs via `fromDomain()`, never raw entities.
- Error handling belongs in the service, not the controller.

---

## 6. Module – `{name}.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {Name} } from './entities/{name}.entity';
import { {Name}Service } from './{name}.service';
import { {Name}Controller } from './{name}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([{Name}])],
  providers: [{Name}Service],
  exports: [{Name}Service],
  controllers: [{Name}Controller],
})
export class {Name}Module {}
```

If the feature needs services from other modules, add them to `imports` and import the other module:

```typescript
imports: [TypeOrmModule.forFeature([{Name}]), AccountsModule],
```

---

## 7. Register in AppModule

In `apps/api/src/app.module.ts`:

```typescript
// Add the import at the top with the other feature imports:
import { {Name}Module } from './features/{name}/{name}.module';

// Add to the // APP MODULES section:
{Name}Module,
```

---

## Checklist

- [ ] Entity extends `BaseDbEntity` and has `user_id` column
- [ ] `fromDomain` mapper never exposes `user_id` or `deleted_at`
- [ ] Service methods use object-argument pattern `{ id, userId, dto }`
- [ ] All service queries scoped by `userId`
- [ ] Controller uses `@RequestUser()` and `ParseUUIDPipe`
- [ ] Every DTO property has accurate `@ApiProperty` metadata, using `required: false` for optional fields
- [ ] Arrays, nested DTOs, dates, UUIDs, enums, maps, unions, and response wrappers have explicit schemas
- [ ] Every route has `@ApiOperation`, an explicit success response, and explicit body/param/query metadata where applicable
- [ ] Module registered in `app.module.ts`
