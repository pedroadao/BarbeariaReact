import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as useAuthModule from '../lib/auth/useAuth'
import { AdminRoute } from './AdminRoute'

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/agendamentos" element={<div>Página de agendamentos</div>} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Página de administração</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function mockUser(email: string | null) {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    status: 'authenticated',
    user: email ? { id: '1', email, name: 'Usuário' } : null,
    login: vi.fn(),
    completeCallback: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn(),
  })
}

describe('AdminRoute', () => {
  it('redireciona usuários que não são admin@admin.com', () => {
    mockUser('cliente@qualquer.com')

    renderAdminRoute()

    expect(screen.getByText('Página de agendamentos')).toBeInTheDocument()
  })

  it('permite acesso ao admin@admin.com', () => {
    mockUser('admin@admin.com')

    renderAdminRoute()

    expect(screen.getByText('Página de administração')).toBeInTheDocument()
  })
})
