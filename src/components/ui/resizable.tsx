import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface ResizablePanelProps {
  defaultWidth: number
  minWidth?: number
  maxWidth?: number
  children: React.ReactNode
  side?: 'left' | 'right'
  onWidthChange?: (width: number) => void
  className?: string
}

export function ResizablePanel({
  defaultWidth,
  minWidth = 300,
  maxWidth = 600,
  children,
  side = 'right',
  onWidthChange,
  className,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = side === 'right'
        ? window.innerWidth - e.clientX
        : e.clientX
      
      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, newWidth))
      setWidth(clampedWidth)
      onWidthChange?.(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = isResizing ? 'col-resize' : ''
    document.body.style.userSelect = isResizing ? 'none' : ''

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minWidth, maxWidth, side, onWidthChange])

  // Load saved width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('chat-panel-width')
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10)
      if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        setWidth(parsed)
      }
    }
  }, [minWidth, maxWidth])

  // Save width to localStorage
  useEffect(() => {
    localStorage.setItem('chat-panel-width', width.toString())
  }, [width])

  return (
    <div
      ref={panelRef}
      style={{ width }}
      className={cn('relative flex flex-col overflow-hidden', className)}
    >
      {/* Resize handle */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-2 cursor-col-resize group z-10',
          'flex items-center justify-center',
          side === 'left' ? 'right-0' : 'left-0'
        )}
        onMouseDown={handleMouseDown}
      >
        <div
          className={cn(
            'w-1 h-12 rounded-full transition-colors',
            isResizing
              ? 'bg-accent'
              : 'bg-border group-hover:bg-accent/50'
          )}
        />
        <GripVertical
          className={cn(
            'absolute w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity',
            side === 'left' ? 'right-0.5' : 'left-0.5'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
