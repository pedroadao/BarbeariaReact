import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../api/authApi'
import { RegisterPage } from './RegisterPage'

vi.mock('../api/authApi')

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/registrar']}>
      <Routes>
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/login" element={<div>Página de login</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('exibe mensagens de validação quando os campos estão vazios', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe o e-mail.')).toBeInTheDocument()
    expect(screen.getByText('A senha deve ter no mínimo 8 caracteres.')).toBeInTheDocument()
    expect(authApi.register).not.toHaveBeenCalled()
  })

  it('exibe erro quando a confirmação de senha não coincide', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('Nome'), 'Maria Cliente')
    await user.type(screen.getByLabelText('E-mail'), 'maria@cliente.com')
    await user.type(screen.getByLabelText('Senha'), 'senha1234')
    await user.type(screen.getByLabelText('Confirmar senha'), 'outrasenha')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('As senhas não coincidem.')).toBeInTheDocument()
    expect(authApi.register).not.toHaveBeenCalled()
  })

  it('cria a conta e redireciona para o login', async () => {
    vi.mocked(authApi.register).mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('Nome'), 'Maria Cliente')
    await user.type(screen.getByLabelText('E-mail'), 'maria@cliente.com')
    await user.type(screen.getByLabelText('Senha'), 'senha1234')
    await user.type(screen.getByLabelText('Confirmar senha'), 'senha1234')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('Página de login')).toBeInTheDocument()
    expect(authApi.register).toHaveBeenCalledWith({
      nome: 'Maria Cliente',
      email: 'maria@cliente.com',
      senha: 'senha1234',
      confirmarSenha: 'senha1234',
    })
  })

  it('exibe mensagem de erro quando o cadastro falha', async () => {
    const { HttpError } = await import('../../../lib/http/httpClient')
    vi.mocked(authApi.register).mockRejectedValue(new HttpError('conflict', 'E-mail já cadastrado.', 409, null))
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('Nome'), 'Maria Cliente')
    await user.type(screen.getByLabelText('E-mail'), 'maria@cliente.com')
    await user.type(screen.getByLabelText('Senha'), 'senha1234')
    await user.type(screen.getByLabelText('Confirmar senha'), 'senha1234')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail já cadastrado.')
  })
})
