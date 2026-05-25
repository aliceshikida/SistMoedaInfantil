import { SchoolBackdrop } from './SchoolBackdrop.jsx'

export function AuthShell({ children, className = '' }) {
  return (
    <main className={`auth-shell ${className}`.trim()}>
      <SchoolBackdrop />
      <div className="auth-shell-inner">{children}</div>
    </main>
  )
}
