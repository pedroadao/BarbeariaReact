import { env } from '../../config/env'

export type HttpErrorKind = 'validation' | 'notFound' | 'conflict' | 'server' | 'network' | 'unknown'

export class HttpError extends Error {
  readonly kind: HttpErrorKind
  readonly status: number | null
  readonly body: unknown

  constructor(kind: HttpErrorKind, message: string, status: number | null, body: unknown) {
    super(message)
    this.name = 'HttpError'
    this.kind = kind
    this.status = status
    this.body = body
  }
}

function kindFromStatus(status: number): HttpErrorKind {
  if (status === 400 || status === 422) return 'validation'
  if (status === 404) return 'notFound'
  if (status === 409) return 'conflict'
  if (status >= 500) return 'server'
  return 'unknown'
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) return null

  try {
    return await response.json()
  } catch {
    return null
  }
}

function messageFromBody(body: unknown, kind: HttpErrorKind): string {
  if (typeof body === 'object' && body !== null) {
    const record = body as Record<string, unknown>
    if (typeof record.mensagem === 'string') return record.mensagem
    if (typeof record.title === 'string') return record.title
  }

  return defaultMessageFor(kind)
}

function defaultMessageFor(kind: HttpErrorKind): string {
  switch (kind) {
    case 'validation':
      return 'Os dados enviados são inválidos.'
    case 'notFound':
      return 'Recurso não encontrado.'
    case 'conflict':
      return 'A operação conflita com o estado atual do recurso.'
    case 'server':
      return 'O servidor encontrou um erro. Tente novamente mais tarde.'
    default:
      return 'Ocorreu um erro inesperado.'
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: BodyInit
  signal?: AbortSignal
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${env.VITE_API_BASE_URL}${path}`

  let response: Response
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body,
      signal: options.signal,
    })
  } catch (error) {
    throw new HttpError('network', 'Não foi possível conectar ao servidor.', null, error)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body = await parseBody(response)

  if (!response.ok) {
    const kind = kindFromStatus(response.status)
    throw new HttpError(kind, messageFromBody(body, kind), response.status, body)
  }

  return body as T
}

export function jsonBody(value: unknown): RequestOptions['body'] {
  return JSON.stringify(value)
}

export const jsonHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
}
