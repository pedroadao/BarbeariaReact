import { useState } from 'react'
import { HttpError } from '../../../lib/http/httpClient'
import { BarbeiroForm } from '../components/BarbeiroForm'
import {
  useBarbeiros,
  useCreateBarbeiro,
  useDeleteBarbeiro,
  useUpdateBarbeiro,
} from '../hooks/useBarbeiros'
import type { BarbeiroFormValues } from '../schemas/barbeiroSchema'
import type { Barbeiro } from '../types'

const TIPO_USUARIO_BARBEIRO = 1

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Ocorreu um erro inesperado.'
}

export function BarbeirosPage() {
  const { data: barbeiros, isLoading, isError, error } = useBarbeiros()
  const createMutation = useCreateBarbeiro()
  const updateMutation = useUpdateBarbeiro()
  const deleteMutation = useDeleteBarbeiro()
  const [editing, setEditing] = useState<Barbeiro | null>(null)

  function handleCreate(values: BarbeiroFormValues) {
    createMutation.mutate(
      { ...values, idTipoUsuario: TIPO_USUARIO_BARBEIRO, instagram: values.instagram || null },
      { onSuccess: () => createMutation.reset() },
    )
  }

  function handleUpdate(values: BarbeiroFormValues) {
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
      <h1>Barbeiros</h1>

      <h2>{editing ? `Editar barbeiro #${editing.id}` : 'Novo barbeiro'}</h2>
      <BarbeiroForm
        key={editing?.id ?? 'new'}
        defaultValues={editing ? { ...editing, instagram: editing.instagram ?? '' } : undefined}
        isSubmitting={editing ? updateMutation.isPending : createMutation.isPending}
        submitLabel={editing ? 'Salvar alterações' : 'Cadastrar barbeiro'}
        onSubmit={editing ? handleUpdate : handleCreate}
      />
      {editing && <button type="button" onClick={() => setEditing(null)}>Cancelar edição</button>}
      {createMutation.isError && <p role="alert">{errorMessage(createMutation.error)}</p>}
      {updateMutation.isError && <p role="alert">{errorMessage(updateMutation.error)}</p>}

      <h2>Lista de barbeiros</h2>
      {isLoading && <p>Carregando barbeiros...</p>}
      {isError && <p role="alert">{errorMessage(error)}</p>}
      {!isLoading && !isError && barbeiros?.length === 0 && <p>Nenhum barbeiro cadastrado.</p>}

      {barbeiros && barbeiros.length > 0 && (
        <ul>
          {barbeiros.map((barbeiro) => (
            <li key={barbeiro.id}>
              <span>
                {barbeiro.nome} — {barbeiro.email} — {barbeiro.telefone}
              </span>
              <button type="button" onClick={() => setEditing(barbeiro)}>
                Editar
              </button>
              <button type="button" onClick={() => handleDelete(barbeiro.id)} disabled={deleteMutation.isPending}>
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
