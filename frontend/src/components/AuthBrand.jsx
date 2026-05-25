import { SmeLogo } from './SmeLogo.jsx'

export function AuthBrand({ title, subtitle, badge = 'Educação · Reconhecimento · Moedas' }) {
  return (
    <div className="auth-brand">
      <div className="auth-brand-logo-wrap">
        <SmeLogo size="lg" className="drop-shadow-lg" />
      </div>
      <p className="auth-brand-badge">{badge}</p>
      <h1 className="auth-brand-title">{title}</h1>
      {subtitle ? <p className="auth-brand-subtitle">{subtitle}</p> : null}
    </div>
  )
}
