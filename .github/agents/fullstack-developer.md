# Full Stack Developer Profile - Copilot Instructions

You are assisting a **Full Stack Developer** expert in:

- **TypeScript** - frontend and backend
- **Backend Development** with NestJS
- **Mobile Development** with Expo and React Native
- **Web Development** with React, Mantine UI, and modern web practices

## Shared Code Quality Standards

- Write clean, maintainable TypeScript with strict types
- Favor functional React patterns with hooks
- Keep UI responsive and accessible with Mantine components
- Implement clear error handling and validation
- Use async/await consistently

## Architecture & Structure

- **Backend**: NestJS for API development with clear separation of concerns
- **Frontend**: React with TanStack Router for routing and React Query for state management
- **Mobile**: Expo for cross-platform development with shared TypeScript types
- **Shared**: Leverage monorepo structure with workspaces for code sharing

## File Organization

- Keep API types (`*Dto`, `*Request`) separate from UI components
- Use feature-based folder structure
- Separate business logic from UI components
- Create custom hooks for reusable logic

## Mantine UI Guidelines

- Use Mantine components for consistent UI
- Leverage theme system for customization
- Apply proper spacing and typography
- Ensure accessibility with semantic HTML
- Mantine documentation: https://mantine.dev/llms.txt

## Mobile Development (Expo)

- Use React Native components from Mantine when available
- Handle platform differences gracefully
- Manage permissions and native features properly
- Test on both iOS and Android simulators

## Testing & Documentation

- Write meaningful commit messages
- Document complex business logic
- Consider edge cases and error scenarios
- Optimize performance in list renders and data fetching

## Dependencies

Reference workspace dependencies - use monorepo packages like:

- `@guallet/api-client` - API client
- `@guallet/api-react` - React hooks for API
- `@mantine/core` - UI components
- `dayjs` - Date handling
- `zod` - Type-safe validation

## Common Tasks

- Building features across mobile and web simultaneously
- Sharing logic between platforms via monorepo packages
- Styling consistently across platforms using Mantine
- Managing complex state with TanStack Query

Focus on code quality, type safety, and user experience across all platforms.

# NestJS Developer Instructions

You are assisting a **NestJS Backend Developer** expert in:

- **NestJS Framework** for building scalable server-side applications
- **TypeScript** with strong type safety
- **RESTful API Design** and Best Practices
- **Database Design** and ORM patterns
- **Authentication & Authorization**

Apply the shared code quality standards above and additionally:

- Follow SOLID principles and domain-driven module boundaries
- Use JSDoc where complex flows need clarification
- Keep formatting consistent across modules

## NestJS Architecture

### Project Structure

```
src/
├── app.module.ts
├── main.ts
├── features/
│   ├── feature1/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── entities/
│   │   └── feature1.module.ts
│   └── feature2/
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── decorators/
│   └── middleware/
└── database/
    ├── migrations/
    └── seeders/
```

## Core Concepts

### Modules

- One module per feature
- Clear separation of concerns
- Import/export necessary providers
- Use `forRoot()` pattern for configurable modules

### Controllers

- Handle HTTP requests/responses
- Validate request DTOs
- Keep logic minimal (delegate to services)
- Use proper HTTP status codes
- Implement request/response validation

### Services

- Contain business logic
- Use dependency injection
- Handle database operations
- Implement error handling
- Make external API calls

### DTOs (Data Transfer Objects)

- Define request/response shapes
- Use validation decorators (`class-validator`)
- Type-safe payloads
- Document with JSDoc
- Separate input and output DTOs

```typescript
// Example DTO
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
```

### Entities & Database

- Use TypeORM or Prisma for database operations
- Define clear entity relationships
- Implement proper indexes
- Use migrations for schema changes
- Handle soft deletes when appropriate

## API Design

### RESTful Conventions

- Use correct HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Return appropriate status codes (200, 201, 400, 401, 404, 500)
- Use consistent naming conventions
- Implement pagination, filtering, and sorting for list endpoints

### Endpoint Structure

```
GET    /api/features            - List all
GET    /api/features/:id        - Get single
POST   /api/features            - Create
PUT    /api/features/:id        - Update full
PATCH  /api/features/:id        - Partial update
DELETE /api/features/:id        - Delete
```

## Authentication & Authorization

### JWT Implementation

- Use JWT for stateless authentication
- Implement refresh token rotation
- Handle token expiration properly
- Validate tokens on protected routes
- Use guards for authorization

### Security

- Hash passwords with bcrypt
- Validate all inputs with class-validator
- Implement rate limiting
- Use HTTPS in production
- Sanitize error messages
- Implement CORS properly
- Validate API keys

## Error Handling

### Exception Handling

- Use NestJS built-in exceptions
- Create custom exception filters
- Return meaningful error messages
- Log errors appropriately
- Don't expose sensitive information

```typescript
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Access denied');
throw new NotFoundException('Resource not found');
```

## Testing

### Unit Tests

- Test services in isolation
- Mock external dependencies
- Cover happy paths and error cases
- Use Jest for testing framework
- Aim for >80% coverage

### Integration Tests

- Test controllers with mocked database
- Test database operations
- Test API endpoints end-to-end
- Use test databases

### E2E Tests

- Test complete user flows
- Use test database
- Verify API contracts
- Test error scenarios

## Database Operations

### Best Practices

- Use transactions for multi-step operations
- Implement proper relationships (one-to-many, many-to-many)
- Use indexes on frequently queried fields
- Implement soft deletes for audit trails
- Use migrations for schema changes
- Handle N+1 query problems with eager loading

### Query Optimization

- Use `select` to limit columns
- Use `where` clauses to filter early
- Eager load related data
- Monitor query performance

## Logging & Monitoring

- Use NestJS Logger for application logs
- Log important operations
- Use log levels appropriately (error, warn, debug, verbose)
- Implement distributed tracing if needed
- Monitor API performance
- Set up alerts for errors

## Documentation

### API Documentation

- Use Swagger/OpenAPI for API docs
- Document endpoints with descriptions
- Include request/response examples
- Document error responses
- Keep documentation up-to-date

### Code Documentation

- Document complex logic with JSDoc
- Explain business rules
- Document database schemas
- Provide usage examples

## Common Tasks

- Creating CRUD endpoints
- Implementing authentication flows
- Building database migrations
- Handling file uploads
- Implementing caching strategies
- Setting up webhooks
- Integrating with external services

## Dependencies & Tools

- **ORM**: TypeORM
- **Validation**: class-validator, class-transformer
- **Authentication**: passport, @nestjs/jwt
- **Documentation**: @nestjs/swagger
- **Testing**: @nestjs/testing, jest
- **Logging**: Pino
- **Environment**: @nestjs/config

## Performance Best Practices

- Use caching for frequently accessed data
- Implement database query optimization
- Use connection pooling
- Monitor and profile performance
- Implement pagination for large datasets
- Use asynchronous operations
- Implement background jobs for long operations

Focus on building robust, scalable, and well-documented APIs that are production-ready and maintainable.

# Web Developer Profile Instructions

You are assisting a **Web Developer** expert in:

- **React** with TypeScript
- **Mantine UI** component library
- **Modern Web Development** best practices
- **Responsive Design** and Web Standards

Apply the shared code quality standards above; ensure components stay semantic, accessible, and cross-browser friendly.

## Architecture & Structure

- **Framework**: React with TanStack Router for routing
- **State Management**: React Query (TanStack Query) for server state
- **Styling**: Mantine UI theme system
- **Forms**: Mantine Form with Zod validation
- **Internationalization**: react-i18next for multi-language support

## Component Development

- Create reusable, composable components
- Use Mantine components as the base layer
- Apply consistent spacing and typography via Mantine theme
- Implement proper prop validation with TypeScript
- Document component APIs with JSDoc comments

## Mantine UI Best Practices

- Leverage Mantine's responsive system (`xs`, `sm`, `md`, `lg`, `xl`)
- Use Mantine hooks like `useMantineTheme()`, `useMediaQuery()`
- Apply Mantine's color system and predefined sizes
- Use Stack, Group, Flex for layout instead of custom CSS
- Implement dark mode support via Mantine theme

## State Management

- Use React Query for API data fetching and caching
- Use local state (useState) for UI-only state
- Use context for cross-cutting concerns
- Implement proper error boundaries
- Handle loading and error states gracefully

## Forms & Validation

- Use Mantine Form for form handling
- Validate with Zod schemas
- Provide clear error messages to users
- Support form submission handling
- Implement proper focus management

## Internationalization

- Use translation keys instead of hardcoded strings
- Follow the `screens.feature.section.key` naming pattern
- Support multiple languages (at least English and Spanish)
- Use i18next for translations

## Performance Optimization

- Memoize expensive computations with `useMemo`
- Use `useCallback` for stable function references
- Optimize re-renders with proper dependency arrays
- Use lazy loading for large lists
- Profile performance issues with React DevTools

## Responsive Design

- Design mobile-first approach
- Test on various screen sizes
- Use Mantine's responsive breakpoints
- Implement touch-friendly interactions
- Ensure proper spacing and sizing on mobile

## Testing & Documentation

- Write semantic, accessible HTML
- Add ARIA labels where necessary
- Document complex component behavior
- Consider edge cases in user interactions
- Validate form inputs properly

## Common Tasks

- Building feature screens and pages
- Creating reusable component libraries
- Implementing data tables and lists
- Building forms with validation
- Implementing responsive layouts
- Adding multi-language support

Focus on creating beautiful, accessible, and performant web experiences with Mantine UI and React.
