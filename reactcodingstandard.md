React Frontend Engineering Standards
Purpose: Build React applications that remain understandable, testable, and safe to change as the codebase, team, and feature set grow.

Applies to: React UI code, client-side state, routing, API integration, styling, testing, and frontend project structure.

Default approach: Prefer simple, explicit, feature-oriented code. Add abstractions when they remove real duplication or complexity—not just to make the code look “architectural.”

1. Core Principles
1. Readability over cleverness. Write code another developer can understand quickly.
2. One clear responsibility per module. Components render UI; hooks coordinate reusable UI logic; services communicate with external systems; utilities are pure reusable functions.
3. Organize by feature. Keep code that changes together close together.
4. Keep dependencies flowing in one direction. Shared low-level modules must not import application features.
5. Make state ownership explicit. Store state at the lowest level that needs it, and lift it only when necessary.
6. Prefer composition to giant components. Compose smaller components rather than building one component with many unrelated responsibilities.
7. Make behavior testable. Separate business rules from rendering and side effects where practical.
8. Use types where available. For new projects, prefer TypeScript. In JavaScript projects, use clear contracts and JSDoc for complex APIs.
9. Automate consistency. Use formatting, linting, type checking, and tests instead of relying on memory.
10. Refactor continuously. Improve nearby code when changing it, without turning every task into a full rewrite.
2. Recommended Project Structure
Use a feature-oriented structure as the default for medium and large applications. Adapt names to the project; do not create empty folders just to match this template.
src/
├── app/
│   ├── App.tsx
│   ├── main.tsx
│   ├── router/
│   │   ├── index.tsx
│   │   └── routeGuards.tsx
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   └── QueryProvider.tsx
│   └── config/
│       └── env.ts
│
├── features/
│   ├── projects/
│   │   ├── api/
│   │   │   ├── projectsApi.ts
│   │   │   └── projectsApi.test.ts
│   │   ├── components/
│   │   │   ├── ProjectCard.tsx
│   │   │   └── ProjectFilters.tsx
│   │   ├── hooks/
│   │   │   └── useProjects.ts
│   │   ├── pages/
│   │   │   ├── ProjectsPage.tsx
│   │   │   └── ProjectDetailsPage.tsx
│   │   ├── schemas/
│   │   │   └── projectSchema.ts
│   │   ├── utils/
│   │   │   └── projectFormatters.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── employees/
│       └── ...
│
├── components/
│   ├── ui/                 # Generic primitives: Button, Dialog, Input
│   ├── layout/             # AppShell, Sidebar, PageHeader
│   └── feedback/           # Spinner, EmptyState, ErrorState
│
├── hooks/                  # Truly cross-feature hooks only
├── lib/
│   ├── httpClient.ts
│   ├── queryClient.ts
│   └── logger.ts
├── services/               # Cross-feature external integrations, if needed
├── store/                  # Global client state, if needed
├── styles/
│   ├── globals.css
│   └── tokens.css
├── types/                  # Truly shared types only
└── utils/                  # Pure, broadly reusable utilities only
Structure rules
- Put feature-specific code in features/<feature-name>/.
- Keep page-level orchestration in pages/; move reusable UI into components/.
- Put a hook beside its feature when it is feature-specific. Promote it to src/hooks/ only when multiple features genuinely use it.
- Use components/ui/ for generic components that do not know about business concepts.
- Keep API calls near the feature that owns the data unless they are truly shared infrastructure.
- Avoid catch-all folders such as misc/, common/, or helpers/ that become dumping grounds. If a shared folder exists, its purpose must be clear.
- Do not make every component its own folder automatically. Use a folder when a component has multiple related files, tests, styles, or subcomponents.
- Avoid giant barrel files. Import from a feature's public entry point only when it improves boundaries; avoid barrels that create circular dependencies.
- Keep filenames and import casing consistent. Use the same casing on disk and in imports.
Small projects
For a small application, a simpler structure is fine:
src/
├── components/
├── pages/
├── hooks/
├── services/
├── utils/
├── App.tsx
└── main.tsx
Move to feature folders when files become difficult to find or features repeatedly require coordinated changes.
3. Component Design Rules
3.1 Keep components focused
A component should have one cohesive reason to change. Split it when it mixes unrelated concerns, for example:
- fetching data, transforming business rules, managing a complex form, and rendering a long page;
- multiple independent sections with separate state and behavior;
- repeated markup that should be a shared component;
- large conditional branches for distinct UI states or variants.
Do not split components solely because they cross an arbitrary line count. Cohesion and complexity matter more than file size.
3.2 Prefer explicit props
type ProjectCardProps = {
  name: string;
  status: 'active' | 'archived';
  onOpen: () => void;
};

export function ProjectCard({
  name,
  status,
  onOpen,
}: ProjectCardProps) {
  return (
    <button type="button" onClick={onOpen}>
      <span>{name}</span>
      <span>{status}</span>
    </button>
  );
}
- Give props meaningful names and explicit types.
- Use discriminated unions for mutually exclusive variants when helpful.
- Avoid passing an entire large object when a component needs only two fields.
- Avoid many boolean props that create unclear combinations. Prefer a clear variant or separate components when behavior genuinely differs.
- Do not pass a callback through many layers without a reason; consider composition, colocated state, or context when appropriate.
- Keep component props stable and minimal. Do not expose internal implementation details unnecessarily.
3.3 Keep rendering declarative
- JSX should describe the UI, not run complex business logic.
- Move complicated transformations into named functions, selectors, or hooks.
- Avoid deeply nested ternaries. Use early returns, named variables, or small subcomponents.
- Use stable keys for lists. Prefer persistent IDs; do not use array indexes when items can be inserted, removed, reordered, or filtered.
- Never call hooks conditionally, inside loops, or inside nested functions. Follow the Rules of Hooks.
- Do not mutate props, state, or objects received from React.
- Use semantic HTML and accessible controls. Use a <button> for actions and an <a> for navigation.
- Do not attach click handlers to non-interactive elements when a semantic element is appropriate.
- Avoid using useEffect to calculate values that can be derived during render.
3.4 Avoid premature abstraction
- Do not create a generic framework for a single use case unless there is a strong expected need.
- Extract repeated code when the behavior is genuinely the same, not merely because two blocks look similar.
- Keep abstractions smaller than the complexity they replace.
- Avoid components with dozens of configuration props. If a component is difficult to use correctly, simplify its API.
4. Naming Conventions
Use one consistent convention throughout the repository.
Item	Convention	Example
React components	PascalCase	ProjectDetails.tsx
Hooks	use + camelCase	useProjectFilters.ts
Functions and variables	camelCase	getProjectById
Constants	camelCase by default; UPPER_SNAKE_CASE for true module-level constants when useful	defaultPageSize
Types and interfaces	PascalCase	ProjectSummary
Test files	Match source + .test or .spec	ProjectCard.test.tsx
CSS modules	Match component	ProjectCard.module.css
Boolean variables	is, has, can, should prefixes	isLoading, hasAccess
Event handlers	handle prefix inside components	handleSubmit
Callback props	on prefix	onSubmit


Rules:
- Prefer names that explain intent, not implementation details.
- Avoid vague names such as data, item, value, temp, helper, or process when a more specific name is available.
- Use domain language consistently. Do not use different names for the same concept across features.
- Avoid abbreviations unless they are established in the project or domain.
- Name files so search results are predictable.
5. State Management
5.1 Choose the smallest appropriate state scope
Use this order as a default:
1. Local component state (useState / useReducer) for local interactions.
2. URL state for shareable, navigable state such as search, filters, sorting, tabs, and pagination.
3. Server-state library (for example, TanStack Query or RTK Query) for fetched data, caching, refetching, and mutation lifecycle.
4. Context for relatively stable values needed by a subtree, such as theme or authenticated-user context.
5. Global client store (for example, Redux Toolkit) for genuinely cross-feature client state that benefits from centralized transitions.
Rules:
- Do not put every state value in a global store.
- Do not duplicate server data in a client store unless there is a clear synchronization strategy.
- Keep state as close as possible to the components that use it.
- Store the minimum necessary state. Derive filtered lists, totals, and display values from existing state.
- Avoid contradictory state, such as storing both isOpen and closed independently.
- Use reducers for complex state transitions, not as a default for every component.
- Keep reducers and selectors pure.
- Model loading, success, empty, and error states explicitly.
- Reset feature state when changing entities or leaving a workflow when stale values would be unsafe.
5.2 Effects
Use useEffect to synchronize React with an external system: subscriptions, browser APIs, imperative libraries, or manually managed requests.
- Do not use effects merely to copy one state variable into another.
- Include every reactive value used by an effect in its dependency list.
- Clean up subscriptions, listeners, timers, and requests when needed.
- Prevent stale requests from overwriting newer results; use cancellation or a request identity strategy.
- Do not suppress dependency lint warnings without understanding and documenting the reason.
- Prefer a server-state library over custom fetching effects for ordinary API data.
5.3 Memoization
- Do not add useMemo, useCallback, or React.memo everywhere.
- First write clear code and measure actual performance issues.
- Memoize when profiling shows expensive recalculation or when stable references are required for a specific optimization.
- Ensure memoization does not obscure behavior or create fragile dependencies.
6. API and Data Access
Keep HTTP details out of presentation components.

Recommended flow:
Page / Component
       ↓
Feature hook or query hook
       ↓
Feature API module
       ↓
Shared HTTP client
       ↓
Backend API
Rules:
- Centralize base URL, common headers, authentication handling, and shared error normalization in one HTTP client where appropriate.
- Keep feature endpoints and request/response types in the feature's API module.
- Use descriptive names such as getProjects, createProject, and updateProject.
- Handle non-success responses and network failures intentionally.
- Do not swallow errors silently.
- Do not expose access tokens, secrets, or private server credentials in frontend code. Frontend environment variables are generally public once bundled.
- Validate untrusted API data at runtime when the application requires strong guarantees; TypeScript types alone do not validate network responses.
- Avoid making duplicate requests because several components independently fetch the same data. Use a shared query/cache strategy.
- Cancel or ignore obsolete requests where relevant.
- Keep pagination, sorting, filtering, and retry behavior consistent.
- Normalize API errors into a shape that the UI can handle.
- Do not couple UI components to raw backend response shapes when a small feature-level adapter would make the UI clearer.
7. Forms and Validation
- Use controlled inputs when React must own the current value; otherwise, use an appropriate form library's recommended pattern.
- For complex forms, prefer a dedicated library such as React Hook Form rather than hand-writing repetitive state for every field.
- Keep validation rules reusable and close to the form/domain they describe.
- Validate on the client for fast feedback, but always validate on the server for security and correctness.
- Show field-level messages and a clear form-level error when submission fails.
- Disable or otherwise protect against duplicate submissions while a request is in progress.
- Preserve user input when safe and useful after an error.
- Associate labels with fields and make errors accessible to assistive technology.
- Separate create and edit defaults clearly; avoid accidental mutation of shared default objects.
- Confirm destructive actions when consequences are significant.
8. Error, Loading, and Empty States
Every data-driven screen should deliberately handle:
- initial loading;
- successful content;
- successful response with no results;
- request failure;
- permission-denied or unauthenticated state, when applicable;
- partial data, where the product supports it;
- retry or recovery, where useful.
Rules:
- Do not show an endless spinner after a request fails.
- Use reusable LoadingState, ErrorState, and EmptyState components where they improve consistency.
- Log diagnostic details through an appropriate logging/monitoring system, but do not expose sensitive internals to end users.
- Give users actionable messages rather than raw stack traces or database errors.
- Do not catch an error only to ignore it.
9. Styling and UI Consistency
Choose one main styling approach for the project and document it. Examples include CSS Modules, Tailwind CSS, or a component library. Mixing systems without a reason makes maintenance harder.
- Centralize design tokens for colors, spacing, typography, radii, shadows, and breakpoints.
- Avoid scattering repeated magic values throughout styles.
- Prefer component-scoped styles or clear naming to prevent accidental global leakage.
- Avoid !important unless there is a documented, unavoidable integration constraint.
- Keep responsive behavior intentional; test narrow, medium, and wide viewports.
- Use shared UI primitives for repeated interaction patterns, but keep them generic and accessible.
- Ensure visible focus states, keyboard navigation, adequate contrast, and reduced-motion support where applicable.
- Do not use color alone to communicate status.
- Avoid inline styles for large style systems; use them for genuinely dynamic values when appropriate.
- Keep CSS selectors shallow and predictable.
- Do not add global CSS rules that unintentionally affect every button, card, or input.
10. Accessibility
Accessibility is part of implementation, not a final polish task.
- Use semantic elements (main, nav, header, button, label, etc.).
- All functionality must be usable with a keyboard.
- Provide accessible names for icon-only controls.
- Give images meaningful alt text when informative; use empty alt text for decorative images.
- Keep focus visible and manage focus in dialogs and other overlays.
- Use ARIA only when native HTML semantics are insufficient.
- Ensure dialogs can be dismissed and do not allow keyboard focus to escape incorrectly.
- Announce important async status changes when necessary.
- Do not nest interactive elements (for example, a button inside a button or a link inside a button).
11. Routing and Feature Boundaries
- Keep route definitions centralized or organized through a clear route structure.
- Lazy-load routes or heavy feature bundles when it benefits initial load time.
- Keep route components focused on composing a page and its feature components.
- Put authorization checks at the appropriate route/UI boundary for user experience, but never treat frontend route guards as the only security control. The backend must enforce authorization.
- Keep route parameters and query parameters validated and parsed.
- Avoid importing one feature's private internals from another feature. Expose a small public API where needed.
- Shared modules must not import feature modules; this prevents circular dependencies and preserves layering.
- If two features need the same business rule, decide which domain owns it before moving it to shared code.
12. TypeScript Standards (Recommended)
For new or substantially refactored React code, prefer TypeScript.
- Enable strict type checking and fix errors rather than broadly bypassing them.
- Avoid any. Prefer a real type, unknown plus narrowing, or a safe generic.
- Avoid unnecessary type assertions (as SomeType) that silence useful checks.
- Type component props, public functions, API boundaries, and complex state.
- Prefer union types for finite states, such as:type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
- Use type or interface consistently according to team convention; do not spend effort changing one to the other without a reason.
- Derive types from schemas or API contracts when practical to avoid drift.
- Avoid enums when a string-literal union or constant object is simpler for the use case.
- Do not add redundant types for obvious local values if inference is clear.
- Use unknown for untrusted input and narrow it before use.
- Keep shared types genuinely shared; avoid a single enormous global types.ts.
13. Testing Strategy
Write tests around user-visible behavior and important business rules, not implementation trivia.
Recommended layers
1. Unit tests: Pure functions, formatters, calculations, validators, reducers, and selectors.
2. Component tests: User interactions, conditional UI, accessibility behavior, loading/error states.
3. Integration tests: Feature flows across components, API layer, and state.
4. End-to-end tests: Critical user journeys such as login, create/edit workflows, and payment or other high-impact paths.
Rules:
- Use React Testing Library principles: test what the user sees and does.
- Prefer accessible queries such as role and label.
- Mock network boundaries rather than every internal function.
- Test edge cases: empty data, malformed input, slow requests, failures, permissions, and repeated submissions.
- Avoid tests that depend on internal component state or exact implementation details.
- Keep tests deterministic and independent.
- Fix flaky tests instead of repeatedly rerunning them until they pass.
- Do not chase a universal coverage percentage at the expense of meaningful tests. Protect critical business rules and flows.
14. Performance and Scale
“Scalable code” means that the codebase can grow without every change becoming risky. It does not mean adding abstractions everywhere.
- Measure before optimizing.
- Use route-level code splitting for large applications where appropriate.
- Avoid rendering large lists without pagination or virtualization when the item count and UI cost justify it.
- Avoid unnecessary state updates and broad context values that cause large parts of the app to rerender.
- Keep expensive calculations out of hot render paths; memoize only when needed.
- Optimize images, fonts, and large dependencies.
- Avoid importing an entire utility library when a smaller import is available.
- Use server pagination/filtering for large datasets when appropriate.
- Avoid fetching data that the current screen does not need.
- Keep performance-sensitive components simple and profile them under realistic data.
- Treat bundle size and runtime performance as measurable concerns, not assumptions.
15. Security
- Never rely on hidden UI controls or frontend route guards to secure data or actions.
- The server must authenticate and authorize every protected operation.
- Do not store sensitive secrets in source code or client-exposed environment variables.
- Avoid rendering untrusted HTML. If HTML rendering is required, sanitize it using a trusted approach.
- Avoid unsafe URL construction from untrusted values.
- Do not log tokens, passwords, personal data, or sensitive API payloads.
- Apply appropriate Content Security Policy and security headers at the hosting/backend layer.
- Keep dependencies updated and review dependency changes.
- Treat browser storage as accessible to scripts running in the same origin; choose token/session storage based on the application's threat model.
- Validate inputs on both client and server.
16. Code Quality Automation
Use automated checks in local development and CI.

Recommended baseline:
- Formatter: Prettier.
- Linting: ESLint with React, Hooks, accessibility, and TypeScript rules appropriate to the stack.
- Type checking: tsc --noEmit for TypeScript projects.
- Tests: Unit/component/integration tests relevant to the change.
- Build: Production build must pass.
- CI: Run the required checks on every pull request.
Example scripts (adapt to the repository and package manager):
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
These scripts are illustrative. A JavaScript-only app, Create React App app, Next.js app, or another build system may need different commands. Do not copy scripts blindly.
17. File Size and Complexity Guidelines
There is no universal correct line limit. Use these as review triggers, not strict laws:
- Around 150–250 lines in a component file: check whether the file contains multiple responsibilities.
- Around 300–500 lines in a module: consider whether distinct logic can be extracted.
- A function with many branches, nested conditions, or a long parameter list deserves review even if it is short.
- A component with many independent state variables, effects, or handlers may be doing too much.
- A feature with many cross-folder imports may have unclear ownership.
When a file grows:
1. Identify the distinct responsibilities.
2. Extract cohesive UI into child components.
3. Extract reusable stateful behavior into custom hooks.
4. Move pure business rules into named functions or domain modules.
5. Keep API communication in API modules.
6. Add tests around behavior before or during risky refactoring.
7. Keep the public API small and update imports.
8. Avoid splitting a file into many tiny files that are harder to navigate than the original.
Do not split code only to reduce line count. The goal is easier reasoning and safer change.
18. Anti-Patterns to Avoid
Avoid these patterns unless there is a clear, documented reason:
- A single giant App.tsx containing all routes, business logic, API calls, and page markup.
- Giant components that manage unrelated sections of a page.
- One global store for every UI and server-state value.
- useEffect chains that copy state between variables.
- Repeated API calls directly inside many components.
- Deeply nested ternaries and anonymous inline business rules.
- Overusing useMemo, useCallback, and React.memo.
- any everywhere or broad lint/type suppressions.
- Huge utils.ts, types.ts, or constants.ts files.
- Circular imports between features.
- Importing private files across feature boundaries.
- Boolean prop combinations that allow invalid UI states.
- Index keys for reorderable lists.
- Swallowing errors or displaying raw technical errors to users.
- Unvalidated data assumptions at API boundaries.
- Making a generic abstraction before there is a real use case.
- Refactoring the whole application in one large, hard-to-review pull request.
- Mixing multiple styling, fetching, form, and state-management patterns without a reason.
19. Practical Pull Request Checklist
Before marking a change ready for review:
Design and structure
- [ ] Each component/module has a clear responsibility.
- [ ] Feature-specific code is located with its feature.
- [ ] No unnecessary cross-feature imports or circular dependencies were introduced.
- [ ] Names communicate intent.
- [ ] The implementation is simpler than the problem it solves.
React behavior
- [ ] Hooks follow the Rules of Hooks.
- [ ] State is stored at the appropriate scope.
- [ ] Derived values are not redundantly stored.
- [ ] Effects have correct dependencies and cleanup where needed.
- [ ] Lists use stable keys.
- [ ] Loading, empty, error, and success states are handled.
Data and security
- [ ] API errors are handled.
- [ ] Inputs are validated.
- [ ] No secrets or sensitive data are exposed or logged.
- [ ] Backend authorization remains authoritative.
UI quality
- [ ] Keyboard and accessibility behavior is considered.
- [ ] Responsive layout is checked.
- [ ] Styling follows existing project conventions.
- [ ] Destructive or duplicate-submit actions are handled safely.
Verification
- [ ] Relevant tests were added or updated.
- [ ] Lint passes.
- [ ] Type check passes, if applicable.
- [ ] Production build passes.
- [ ] Any significant trade-offs are explained in the PR.
20. Suggested Team Workflow
1. Understand the feature: identify its route, domain entities, API contract, states, and user interactions.
2. Find the owner: decide which feature folder should contain the implementation.
3. Plan the boundary: identify UI components, hooks, API calls, types, and business rules.
4. Implement the smallest complete slice: avoid speculative architecture.
5. Test behavior: include success, empty, error, and important edge cases.
6. Run automated checks: lint, type-check, tests, and build.
7. Review for maintainability: check naming, duplication, responsibilities, and dependency direction.
8. Document only what needs explaining: prefer clear code; document non-obvious decisions and constraints.
9. Refactor incrementally: keep pull requests focused and easy to review.
21. Architecture Decision Rules
When choosing a pattern, ask:
- Is this logic used by more than one place?
- Is the behavior genuinely the same, or only superficially similar?
- Does this abstraction make the call site easier to understand?
- Who owns this data and business rule?
- Can this code be tested without rendering the entire application?
- Will a new developer know where to add the next related change?
- Does this introduce another state source or dependency that must be synchronized?
- Is the complexity justified by a real current requirement?
If the answers do not justify a new abstraction, keep the implementation simple.
22. Definition of Done
A React change is complete when:
- the behavior meets the requirement;
- code is located in the correct feature/module;
- components and functions have cohesive responsibilities;
- errors and important edge cases are handled;
- accessibility and responsive behavior are considered;
- relevant tests and automated checks pass;
- no secrets or unsafe trust assumptions were introduced;
- the change is reviewable and does not add avoidable complexity.
Final Rule
Optimize for the next developer who has to change the code—not for the smallest file, the fewest lines, or the most sophisticated architecture.

A maintainable React application is built through consistent boundaries, explicit state ownership, predictable naming, automated checks, meaningful tests, and small, deliberate refactors.