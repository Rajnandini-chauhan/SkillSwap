export function BrandMark({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#9b7cff] via-[#8060ef] to-[#6544d7] text-white shadow-[0_10px_26px_rgba(118,87,232,.28)] ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[54%] w-[54%]" fill="none">
        <path d="M7 16.5 16.5 7M10.5 7h6.5v6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 7.5h-1A2.5 2.5 0 0 0 3 10v8a3 3 0 0 0 3 3h8a2.5 2.5 0 0 0 2.5-2.5v-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity=".72" />
      </svg>
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--card)] bg-[#ffc95c]" />
    </span>
  )
}

export default function BrandLogo({ compact = false, className = '' }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <BrandMark className={compact ? 'h-10 w-10 rounded-xl' : 'h-12 w-12'} />
      <div className="min-w-0">
        <div className={`${compact ? 'text-[17px]' : 'text-[20px]'} truncate font-extrabold tracking-[-0.035em] text-[var(--text)]`}>SkillSwap</div>
        <div className="mt-0.5 truncate text-[11px] font-semibold tracking-wide text-[var(--text3)]">Learn • Share • Grow</div>
      </div>
    </div>
  )
}
