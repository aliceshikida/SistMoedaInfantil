export function SchoolBackdrop() {
  return (
    <div className="auth-school-backdrop" aria-hidden>
      <svg className="auth-school-building" viewBox="0 0 1200 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
        <path
          d="M0 280V120h80l40-70 40 70h80V80l120-50 120 50v40h100V60l150-40 150 40v220H0Z"
          fill="currentColor"
          opacity="0.12"
        />
        <rect x="180" y="140" width="48" height="64" rx="2" fill="currentColor" opacity="0.08" />
        <rect x="260" y="120" width="48" height="84" rx="2" fill="currentColor" opacity="0.08" />
        <rect x="340" y="100" width="56" height="104" rx="2" fill="currentColor" opacity="0.1" />
        <rect x="520" y="90" width="64" height="114" rx="2" fill="currentColor" opacity="0.1" />
        <rect x="620" y="110" width="48" height="94" rx="2" fill="currentColor" opacity="0.08" />
        <rect x="720" y="130" width="52" height="74" rx="2" fill="currentColor" opacity="0.08" />
        <rect x="880" y="100" width="60" height="104" rx="2" fill="currentColor" opacity="0.1" />
        <rect x="980" y="120" width="48" height="84" rx="2" fill="currentColor" opacity="0.08" />
        <path d="M600 30 L560 70 h80 L600 30Z" fill="currentColor" opacity="0.15" />
        <circle cx="600" cy="24" r="8" fill="currentColor" opacity="0.2" />
      </svg>

      <span className="auth-float auth-float--book" />
      <span className="auth-float auth-float--coin" />
      <span className="auth-float auth-float--star" />
    </div>
  )
}
