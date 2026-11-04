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
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Clientes
      </Typography>

      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          {editing ? `Editar cliente #${editing.id}` : 'Novo cliente'}
        </Typography>
        <ClienteForm
          key={editing?.id ?? 'new'}
          defaultValues={editing ? { ...editing, instagram: editing.instagram ?? '' } : undefined}
          isSubmitting={editing ? updateMutation.isPending : createMutation.isPending}
          submitLabel={editing ? 'Salvar alterações' : 'Cadastrar cliente'}
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
          Lista de clientes
        </Typography>
        {isLoading && <Typography>Carregando clientes...</Typography>}
        {isError && <Alert severity="error">{errorMessage(error)}</Alert>}
        {!isLoading && !isError && clientes?.length === 0 && <Typography>Nenhum cliente cadastrado.</Typography>}

        {clientes && clientes.length > 0 && (
          <List disablePadding>
            {clientes.map((cliente, index) => (
              <div key={cliente.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => setEditing(cliente)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(cliente.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Excluir
                      </Button>
                    </Stack>
                  }
                >
                  <ListItemText primary={`${cliente.nome} — ${cliente.email} — ${cliente.telefone}`} />
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
