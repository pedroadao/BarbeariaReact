import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AccessDeniedPage } from './AccessDeniedPage'

describe('AccessDeniedPage', () => {
  it('exibe a mensagem de acesso negado e um link para voltar ao início', () => {
    render(
      <MemoryRouter>
        <AccessDeniedPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/')
  })
})
