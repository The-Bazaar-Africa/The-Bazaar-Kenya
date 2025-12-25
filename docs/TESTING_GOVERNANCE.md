# Testing Governance — The Bazaar

## 1. One Test Runner Per Project
- UI / Vite-based libs → Vitest
- Backend / Node libs → Jest

## 2. No Mixed Imports
- Vitest tests MUST NOT import jest
- Jest tests MUST NOT import vitest

## 3. Setup Files
- Setup files live in `src/test/`
- Test discovery files live in `src/**/__tests__/`

## 4. Nx Enforcement
- Each project defines its own test executor
- Root-level test commands are forbidden

## 5. CI Contract
- `nx test <project>` is the only supported entrypoint

## 6. Hook Testing (React 19+)
- **DO NOT** use `@testing-library/react-hooks` (deprecated)
- **DO** test hooks via component wrappers (probe pattern)

### Example Hook Test Pattern
```tsx
import { render, screen } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

const HookProbe = () => {
  const value = useMyHook()
  return <span data-testid="value">{value}</span>
}

test('useMyHook works', async () => {
  render(<HookProbe />)
  expect(await screen.findByTestId('value')).toBeInTheDocument()
})
```

## 7. Version Governance
- Vite: ^6.x (Storybook-compatible)
- Storybook: 8.6.x (aligned across all packages)
- React: 19.x
