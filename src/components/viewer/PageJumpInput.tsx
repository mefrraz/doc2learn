import { useState, useCallback, useEffect } from 'react'

interface PageJumpInputProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PageJumpInput({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}: PageJumpInputProps) {
  const [inputValue, setInputValue] = useState(currentPage.toString())
  const [isEditing, setIsEditing] = useState(false)

  // Sync input with current page when it changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentPage.toString())
    }
  }, [currentPage, isEditing])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setInputValue(value)
    }
  }, [])

  const handleJumpToPage = useCallback(() => {
    const pageNum = parseInt(inputValue, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum)
    } else {
      // Reset to current page if invalid
      setInputValue(currentPage.toString())
    }
    setIsEditing(false)
  }, [inputValue, totalPages, onPageChange, currentPage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJumpToPage()
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      setInputValue(currentPage.toString())
      setIsEditing(false)
      ;(e.target as HTMLInputElement).blur()
    }
  }, [handleJumpToPage, currentPage])

  const handleFocus = useCallback(() => {
    setIsEditing(true)
    // Select all text on focus for easy editing
    setTimeout(() => {
      const input = document.activeElement as HTMLInputElement
      if (input) input.select()
    }, 0)
  }, [])

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleJumpToPage}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className="w-12 px-2 py-1 text-sm text-center bg-bg-tertiary border border-border rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                   text-text-primary font-mono"
        aria-label={`Current page ${currentPage} of ${totalPages}`}
      />
      <span className="text-sm text-text-muted">/</span>
      <span className="text-sm text-text-secondary font-mono min-w-[24px]">{totalPages}</span>
    </div>
  )
}
