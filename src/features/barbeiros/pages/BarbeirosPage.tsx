import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Barbeiros
      </Typography>

      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          {editing ? `Editar barbeiro #${editing.id}` : 'Novo barbeiro'}
        </Typography>
        <BarbeiroForm
          key={editing?.id ?? 'new'}
          defaultValues={editing ? { ...editing, instagram: editing.instagram ?? '' } : undefined}
          isSubmitting={editing ? updateMutation.isPending : createMutation.isPending}
          submitLabel={editing ? 'Salvar alterações' : 'Cadastrar barbeiro'}
          onSubmit={editing ? handleUpdate : handleCreate}
        />
        {editing && (
          <Button type="button" onClick={() => setEditing(null)} sx={{ alignSelf: 'flex-start' }}>
            Cancelar edição
          </Button>
        )}
        {createMutation.isError && <Alert severity="error">{errorMessage(createMutation.error)}</Alert>}
        {updateMutation.isError && <Alert severity="error">{errorMessage(updateMutation.error)}</Alert>}
      </Stack>

      <Stack spacing={1}>
        <Typography variant="h6" component="h2">
          Lista de barbeiros
        </Typography>
        {isLoading && <Typography>Carregando barbeiros...</Typography>}
        {isError && <Alert severity="error">{errorMessage(error)}</Alert>}
        {!isLoading && !isError && barbeiros?.length === 0 && <Typography>Nenhum barbeiro cadastrado.</Typography>}

        {barbeiros && barbeiros.length > 0 && (
          <List disablePadding>
            {barbeiros.map((barbeiro, index) => (
              <div key={barbeiro.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => setEditing(barbeiro)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(barbeiro.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Excluir
                      </Button>
                    </Stack>
                  }
                >
                  <ListItemText primary={`${barbeiro.nome} — ${barbeiro.email} — ${barbeiro.telefone}`} />
                </ListItem>
              </div>
            ))}
          </List>
        )}
        {deleteMutation.isError && <Alert severity="error">{errorMessage(deleteMutation.error)}</Alert>}
      </Stack>
    </Stack>
  )
}
