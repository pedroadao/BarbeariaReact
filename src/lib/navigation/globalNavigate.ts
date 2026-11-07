type NavigateFn = (path: string) => void

let navigateFn: NavigateFn | null = null

export function setGlobalNavigate(fn: NavigateFn | null): void {
  navigateFn = fn
}

export function navigateGlobally(path: string): void {
  navigateFn?.(path)
}
