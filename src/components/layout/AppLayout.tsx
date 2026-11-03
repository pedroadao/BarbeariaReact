import { NavLink, Outlet } from 'react-router-dom'

const navLinkClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined)

export function AppLayout() {
  return (
    <div>
      <header>
        <h1>Barbearia</h1>
        <nav>
          <NavLink to="/barbeiros" className={navLinkClassName}>
            Barbeiros
          </NavLink>
          <NavLink to="/clientes" className={navLinkClassName}>
            Clientes
          </NavLink>
          <NavLink to="/agendamentos" className={navLinkClassName}>
            Agendamentos
          </NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
