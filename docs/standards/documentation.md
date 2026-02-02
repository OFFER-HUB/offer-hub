# Documentation & Commenting Standards

## Language

- **English only**: All comments, documentation files, and git commits must be in English.
- **No Translation**: Avoid mixing languages in the codebase or documentation.

## Code Commenting (TSDoc)

We follow the TSDoc standard for all TypeScript code.

### Classes

Each class should have a brief description of its responsibility.

```typescript
/**
 * Manages the lifecycle of orders, including creation, funding, and completion.
 */
@Injectable()
export class OrdersService { ... }
```

### Methods

Public methods should document their parameters, return values, and behavior.

```typescript
/**
 * Creates a new order and reserves funds from the buyer's balance.
 * 
 * @param buyerId - The unique identifier of the buyer.
 * @param dto - Data required to create the order.
 * @returns The newly created order object.
 * @throws {InsufficientFundsException} If buyer doesn't have enough balance.
 */
async createOrder(buyerId: string, dto: CreateOrderDto): Promise<Order> { ... }
```

### Types and Interfaces

Document properties where the name is not self-explanatory.

```typescript
export interface DomainEvent<T = unknown> {
    /** Unique event identifier prefixed with evt_ */
    eventId: string;
    /** Type of event from EVENT_CATALOG (e.g., user.created) */
    eventType: string;
    /** Metadata for tracing and isolation */
    metadata: EventMetadata;
    /** Event payload data */
    payload: T;
}
```

## Inline Comments

- **Explain "Why", not "How"**: If the code is complex, explain the reasoning behind the implementation choice.
- **Avoid Redundancy**: Do not comment obvious things (e.g., `i++ // increment i`).
- **TODOs**: Use `TODO: {description}` to mark pending tasks. Include a name or issue reference if possible.

## Documentation Files (.md)

- Use Markdown for all documentation.
- Maintain a professional and technical tone.
- Ensure all diagrams (Mermaid) use English labels.
- Follow the hierarchy defined in the main `README.md`.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` for new features.
- `fix:` for bug fixes.
- `docs:` for documentation changes.
- `test:` for adding or fixing tests.
- `refactor:` for code changes that neither fix a bug nor add a feature.
- `style:` for formatting, missing semi colons, etc.
