import { useCallback, useEffect } from 'react'
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ZoomIn, ZoomOut, Columns, FileText, Maximize2
} from 'lucide-react'
import { PageJumpInput } from './PageJumpInput'

export type ViewMode = 'single' | 'continuous'

interface PDFToolbarProps {
  currentPage: number
  totalPages: number
  scale: number
  viewMode: ViewMode
  onPageChange: (page: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onViewModeChange: (mode: ViewMode) => void
  onToggleFullscreen?: () => void
  className?: string
}

export function PDFToolbar({
  currentPage,
  totalPages,
  scale,
  viewMode,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onViewModeChange,
  onToggleFullscreen,
  className = ''
}: PDFToolbarProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (currentPage > 1) onPageChange(currentPage - 1)
          break
        case 'ArrowRight':
          e.preventDefault()
          if (currentPage < totalPages) onPageChange(currentPage + 1)
          break
        case 'Home':
          e.preventDefault()
          onPageChange(1)
          break
        case 'End':
          e.preventDefault()
          onPageChange(totalPages)
          break
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            onZoomIn()
          }
          break
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            onZoomOut()
          }
          break
        case 'v':
          if (!e.ctrlKey && !e.metaKey) {
            onViewModeChange(viewMode === 'single' ? 'continuous' : 'single')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, viewMode, onPageChange, onZoomIn, onZoomOut, onViewModeChange])

  const goToFirstPage = useCallback(() => onPageChange(1), [onPageChange])
  const goToLastPage = useCallback(() => onPageChange(totalPages), [onPageChange, totalPages])
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }, [currentPage, onPageChange])
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }, [currentPage, totalPages, onPageChange])

  return (
    <div className={`flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border ${className}`}>
      {/* Left: Page Navigation */}
      <div className="flex items-center gap-1">
        {/* First/Last Page */}
        <button
          onClick={goToFirstPage}
          disabled={currentPage <= 1}
          className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title="First page (Home)"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        
        {/* Previous Page */}
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title="Previous page (←)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Jump Input */}
        <PageJumpInput
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mx-2"
        />

        {/* Next Page */}
        <button
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title="Next page (→)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={goToLastPage}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title="Last page (End)"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Center: View Mode Toggle */}
      <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('single')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'single'
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          title="Single page view"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('continuous')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'continuous'
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          title="Continuous scroll view (V)"
        >
          <Columns className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Zoom Controls */}
      <div className="flex items-center gap-2">
        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.5}
          className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title="Zoom out (Ctrl+-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        {/* Zoom Level */}
        <span className="text-sm text-text-secondary font-mono min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          disabled={scale >= 3.0}
          className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title="Zoom in (Ctrl++)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="w-8 h-8 rounded-lg hover:bg-bg-tertiary 
                       flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
