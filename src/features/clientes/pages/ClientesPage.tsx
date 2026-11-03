import { useState } from 'react'
import { HttpError } from '../../../lib/http/httpClient'
import { ClienteForm } from '../components/ClienteForm'
import {
  useClientes,
  useCreateCliente,
  useDeleteCliente,
  useUpdateCliente,
} from '../hooks/useClientes'
import type { ClienteFormValues } from '../schemas/clienteSchema'
import type { Cliente } from '../types'

const TIPO_USUARIO_CLIENTE = 2

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Ocorreu um erro inesperado.'
}

export function ClientesPage() {
  const { data: clientes, isLoading, isError, error } = useClientes()
  const createMutation = useCreateCliente()
  const updateMutation = useUpdateCliente()
  const deleteMutation = useDeleteCliente()
  const [editing, setEditing] = useState<Cliente | null>(null)

  function handleCreate(values: ClienteFormValues) {
    createMutation.mutate(
      { ...values, idTipoUsuario: TIPO_USUARIO_CLIENTE, instagram: values.instagram || null },
      { onSuccess: () => createMutation.reset() },
    )
  }

  function handleUpdate(values: ClienteFormValues) {
    if (!editing) return
    updateMutation.mutate(
      {
        id: editing.id,
        input: { ...values, idTipoUsuario: editing.idTipoUsuario, instagram: values.instagram || null },
      },
      { onSuccess: () => setEditing(null) },
    )
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id)
  }

  return (
    <section>
      <h1>Clientes</h1>

      <h2>{editing ? `Editar cliente #${editing.id}` : 'Novo cliente'}</h2>
      <ClienteForm
        key={editing?.id ?? 'new'}
        defaultValues={editing ? { ...editing, instagram: editing.instagram ?? '' } : undefined}
        isSubmitting={editing ? updateMutation.isPending : createMutation.isPending}
        submitLabel={editing ? 'Salvar alterações' : 'Cadastrar cliente'}
        onSubmit={editing ? handleUpdate : handleCreate}
      />
      {editing && <button type="button" onClick={() => setEditing(null)}>Cancelar edição</button>}
      {createMutation.isError && <p role="alert">{errorMessage(createMutation.error)}</p>}
      {updateMutation.isError && <p role="alert">{errorMessage(updateMutation.error)}</p>}

      <h2>Lista de clientes</h2>
      {isLoading && <p>Carregando clientes...</p>}
      {isError && <p role="alert">{errorMessage(error)}</p>}
      {!isLoading && !isError && clientes?.length === 0 && <p>Nenhum cliente cadastrado.</p>}

      {clientes && clientes.length > 0 && (
        <ul>
          {clientes.map((cliente) => (
            <li key={cliente.id}>
              <span>
                {cliente.nome} — {cliente.email} — {cliente.telefone}
              </span>
              <button type="button" onClick={() => setEditing(cliente)}>
                Editar
              </button>
              <button type="button" onClick={() => handleDelete(cliente.id)} disabled={deleteMutation.isPending}>
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
      {deleteMutation.isError && <p role="alert">{errorMessage(deleteMutation.error)}</p>}
    </section>
  )
}
