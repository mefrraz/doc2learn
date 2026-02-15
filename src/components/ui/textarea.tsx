import { useRef, useEffect, useCallback } from 'react'

interface TextareaProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  maxRows?: number
  minRows?: number
  className?: string
}

export function Textarea({
  value,
  onChange,
  onKeyDown,
  placeholder = '',
  disabled = false,
  maxRows = 15,
  minRows = 1,
  className = '',
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Calculate line height for row calculations
  const getLineHeight = useCallback(() => {
    if (!textareaRef.current) return 24
    const computed = window.getComputedStyle(textareaRef.current)
    return parseFloat(computed.lineHeight) || 24
  }, [])
  
  // Auto-resize textarea based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const lineHeight = getLineHeight()
    const paddingTop = parseFloat(window.getComputedStyle(textarea).paddingTop) || 0
    const paddingBottom = parseFloat(window.getComputedStyle(textarea).paddingBottom) || 0
    const borderTop = parseFloat(window.getComputedStyle(textarea).borderTopWidth) || 0
    const borderBottom = parseFloat(window.getComputedStyle(textarea).borderBottomWidth) || 0
    
    // Reset height to calculate scrollHeight correctly
    textarea.style.height = 'auto'
    
    // Calculate min and max heights
    const minHeight = lineHeight * minRows + paddingTop + paddingBottom + borderTop + borderBottom
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom + borderTop + borderBottom
    
    // Set height based on content, clamped between min and max
    const scrollHeight = textarea.scrollHeight
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
    
    textarea.style.height = `${newHeight}px`
    
    // Enable scroll if content exceeds max rows
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [getLineHeight, maxRows, minRows])
  
  // Adjust height on value change
  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])
  
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={minRows}
      className={`
        w-full resize-none border border-border rounded-lg px-3 py-2
        bg-bg-tertiary text-text-primary placeholder:text-text-muted
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors scrollbar-thin
        ${className}
      `}
      style={{
        lineHeight: '1.5rem',
      }}
    />
  )
}
