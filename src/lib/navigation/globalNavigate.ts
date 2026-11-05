type NavigateFn = (path: string) => void

let navigateFn: NavigateFn | null = null

/**
 * Permite que código fora da árvore de componentes (ex.: o cache global do
 * TanStack Query) solicite uma navegação, sem acoplar essas camadas ao React Router.
 */
export function setGlobalNavigate(fn: NavigateFn | null): void {
  navigateFn = fn
}

export function navigateGlobally(path: string): void {
  navigateFn?.(path)
}
