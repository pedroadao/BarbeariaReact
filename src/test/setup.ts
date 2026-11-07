import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

vi.mock('../lib/auth/silentRenew', () => ({
  trySilentLogin: vi.fn().mockResolvedValue(null),
}))
