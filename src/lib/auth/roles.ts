import type { Me } from '../../features/auth/types'

const ADMIN_EMAIL = 'admin@admin.com'

export function isAdmin(user: Me | null): boolean {
  return user?.email === ADMIN_EMAIL
}
