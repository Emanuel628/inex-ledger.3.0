import type { ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'
import type { AppPage, ThemeMode } from '../App'

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  theme: ThemeMode
  onNavigate: (page: AppPage) => void
  children: ReactNode
}

function AuthShell({ eyebrow, title, description, theme, onNavigate, children }: AuthShellProps) {
  return (
    <main className="auth-shell" data-theme={theme}>
      <section className="auth-brand-panel">
        <button className="auth-brand" type="button" onClick={() => onNavigate('Login')}>
          <span>
            <BarChart3 size={22} />
          </span>
          InEx Ledger
        </button>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="auth-card">
        {children}
      </section>
    </main>
  )
}

export default AuthShell
