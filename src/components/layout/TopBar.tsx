import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Moon, Sun, Command } from 'lucide-react'
import { motion } from 'framer-motion'

interface TopBarProps {
  onSearch?: () => void
}

export function TopBar({ onSearch }: TopBarProps) {
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-lg border-b border-border sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <button
          onClick={onSearch}
          className="flex items-center gap-3 px-4 py-2 bg-bg-tertiary hover:bg-bg-hover rounded-lg text-text-muted hover:text-text-primary transition-colors w-64 group"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search documents...</span>
          <kbd className="hidden sm:flex items-center gap-1 ml-auto text-xs text-text-muted bg-bg-secondary px-1.5 py-0.5 rounded">
            <Command className="w-3 h-3" />
            <span>K</span>
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.div>
          </button>
        </div>
      </div>
    </header>
  )
}
