import { useState, useRef, useEffect, useCallback } from 'react'
import { Maximize2, Minimize2, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CollapsibleChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  maxRows?: number
  className?: string
}

export function CollapsibleChatInput({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  isLoading = false,
  maxRows = 15,
  className = '',
}: CollapsibleChatInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const collapsedInputRef = useRef<HTMLInputElement>(null)
  const expandedTextareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Handle send
  const handleSend = useCallback(() => {
    if (value.trim() && !disabled && !isLoading) {
      onSend()
    }
  }, [value, disabled, isLoading, onSend])
  
  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    // Shift+Enter creates new line in expanded mode
  }, [handleSend])
  
  // Focus management when expanding/collapsing
  useEffect(() => {
    if (isExpanded && expandedTextareaRef.current) {
      expandedTextareaRef.current.focus()
      // Move cursor to end
      const len = expandedTextareaRef.current.value.length
      expandedTextareaRef.current.setSelectionRange(len, len)
    } else if (!isExpanded && collapsedInputRef.current) {
      collapsedInputRef.current.focus()
    }
  }, [isExpanded])
  
  // Auto-resize expanded textarea
  useEffect(() => {
    if (isExpanded && expandedTextareaRef.current) {
      const textarea = expandedTextareaRef.current
      textarea.style.height = 'auto'
      const lineHeight = 24 // 1.5rem
      const maxHeight = lineHeight * maxRows
      const newHeight = Math.min(textarea.scrollHeight, maxHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [value, isExpanded, maxRows])
  
  // Toggle expand/collapse
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev)
  }
  
  return (
    <div className={`bg-bg-secondary ${className}`}>
      {isExpanded ? (
        // Expanded Mode - Full textarea with multiple lines
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs text-text-muted">
              Shift+Enter for new line • Enter to send
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="h-6 w-6 p-0 text-text-muted hover:text-text-primary"
              title="Collapse"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-3">
            <textarea
              ref={expandedTextareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={`
                w-full resize-none border border-border rounded-lg px-3 py-2
                bg-bg-tertiary text-text-primary placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors scrollbar-thin
              `}
              style={{
                lineHeight: '1.5rem',
                minHeight: '120px',
                maxHeight: `${maxRows * 24}px`,
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-text-muted">
                {value.split('\n').length} line(s)
              </span>
              <Button
                onClick={handleSend}
                disabled={!value.trim() || disabled || isLoading}
                className="bg-accent hover:bg-accent-hover text-white px-4 h-9"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Collapsed Mode - Single line input
        <div className="flex items-center gap-2 p-3">
          <input
            ref={collapsedInputRef}
            type="text"
            value={value.split('\n')[0]} // Show only first line
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={`
              flex-1 h-10 px-3 py-2 border border-border rounded-lg
              bg-bg-tertiary text-text-primary placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="h-10 w-10 p-0 text-text-muted hover:text-text-primary border border-border"
            title="Expand to write multiple lines"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!value.trim() || disabled || isLoading}
            className="bg-accent hover:bg-accent-hover text-white h-10 w-10 p-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
