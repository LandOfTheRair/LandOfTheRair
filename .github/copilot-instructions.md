You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Testing Best Practices

- Use command `npx vitest run <file>.spec.ts` to run tests for a file
- Use command `npx vitest run <file>.spec.ts --coverage --coverage.all=false --coverage.include="**/<file>.ts"` to check coverage for a file
- When writing tests and making temporary files to do calculations, those temporary files must be removed after the tests are finalized
- Aim for high test coverage, but prioritize meaningful tests over coverage percentage (80-90% coverage is sufficient)
- Use descriptive test names and organize tests logically
- Mock external dependencies to isolate unit tests
- Use `beforeEach` and `afterEach` hooks for setup and teardown

## Angular Best Practices

- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
