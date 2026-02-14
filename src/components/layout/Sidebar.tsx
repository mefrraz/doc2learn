import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { user, signOut } = useAuthStore()
  
  const navItems = [
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: BookOpen, label: 'Learning', path: '/learn' },
    { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-bg-secondary border-r border-border flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-text-primary">Doc2Learn</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Document Button */}
      <div className="p-3">
        <Link
          to="/documents"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Plus className="w-4 h-4" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                New Document
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-accent-light text-accent'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* AI Quick Access */}
      <div className="px-3 py-2 border-t border-border">
        <Link
          to="/chat"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-accent to-purple-600 text-white hover:opacity-90 transition-opacity ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'AI Assistant' : undefined}
        >
          <Zap className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                AI Assistant
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-accent">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <button
                  onClick={signOut}
                  className="text-xs text-text-muted hover:text-error flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
