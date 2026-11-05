import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as useAuthModule from '../lib/auth/useAuth'
import { ProtectedRoute } from './ProtectedRoute'

function renderProtected(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<div>Página de login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/barbeiros" element={<div>Página protegida</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function mockStatus(status: 'loading' | 'authenticated' | 'unauthenticated') {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    status,
    user: null,
    login: vi.fn(),
    completeCallback: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn(),
  })
}

describe('ProtectedRoute', () => {
  it('redireciona para o login quando não autenticado', () => {
    mockStatus('unauthenticated')

    renderProtected('/barbeiros')

    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('não renderiza nada enquanto o status ainda está carregando', () => {
    mockStatus('loading')

    renderProtected('/barbeiros')

    expect(screen.queryByText('Página de login')).not.toBeInTheDocument()
    expect(screen.queryByText('Página protegida')).not.toBeInTheDocument()
  })

  it('renderiza a rota protegida quando autenticado', () => {
    mockStatus('authenticated')

    renderProtected('/barbeiros')

    expect(screen.getByText('Página protegida')).toBeInTheDocument()
  })
})
