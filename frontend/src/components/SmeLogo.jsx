const sizeMap = {
  sm: 'h-9 w-9',
  md: 'h-14 w-14',
  lg: 'h-[4.5rem] w-[4.5rem]',
  xl: 'h-24 w-24',
}

export function SmeLogo({ size = 'md', className = '', showRing = true }) {
  const dim = sizeMap[size] ?? sizeMap.md

  return (
    <svg
      className={`${dim} shrink-0 ${className}`.trim()}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Moeda Estudantil"
    >
      <circle cx="40" cy="40" r="38" fill="#1a365d" />
      <circle cx="40" cy="40" r="38" fill="url(#sme-logo-shine)" opacity="0.35" />
      {showRing ? <circle cx="40" cy="40" r="34" stroke="#f5b942" strokeWidth="3" opacity="0.95" /> : null}

      <path
        d="M40 20L14 33.5v2.2L40 49l26-13.3v-2.2L40 20Z"
        fill="#f8fafc"
      />
      <path d="M40 49v5.5" stroke="#f5b942" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M28 38.5c2.8 2.2 7.2 3.5 12 3.5s9.2-1.3 12-3.5"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M22 54h36c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H22c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2Z"
        fill="#f8fafc"
        opacity="0.95"
      />
      <path d="M40 54v8" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M28 58h24" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" />

      <circle cx="58" cy="28" r="11" fill="#f5b942" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="58" cy="28" r="7.5" fill="#fde68a" opacity="0.5" />
      <text
        x="58"
        y="32"
        textAnchor="middle"
        fill="#78350f"
        fontSize="11"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        M
      </text>

      <defs>
        <linearGradient id="sme-logo-shine" x1="20" y1="12" x2="60" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1a365d" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
