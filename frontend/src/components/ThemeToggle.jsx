import { useTheme } from '../lib/ThemeContext'

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`inline-flex items-center justify-center rounded-2xl border border-violet-200/70 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15 ${compact ? 'h-10 w-10' : 'h-11 gap-2 px-4'}`}
    >
      <span aria-hidden="true" className="text-lg">{isDark ? '☀️' : '🌙'}</span>
      {!compact && <span className="text-sm font-semibold">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  )
}
