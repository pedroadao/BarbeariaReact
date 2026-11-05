import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setGlobalNavigate } from '../lib/navigation/globalNavigate'

export function GlobalNavigateSetter() {
  const navigate = useNavigate()

  useEffect(() => {
    setGlobalNavigate((path) => navigate(path))
    return () => setGlobalNavigate(null)
  }, [navigate])

  return null
}
