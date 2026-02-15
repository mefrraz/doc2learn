import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { Button } from '@/components/ui/button'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore()
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`w-8 h-8 p-0 ${className}`}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-text-secondary hover:text-text-primary transition-colors" />
      ) : (
        <Sun className="w-4 h-4 text-text-secondary hover:text-text-primary transition-colors" />
      )}
    </Button>
  )
}
