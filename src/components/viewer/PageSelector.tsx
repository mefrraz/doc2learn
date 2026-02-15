import { useState, useEffect, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PageSelectorProps {
  file: Blob | string
  totalPages: number
  selectedPages: number[]
  onSelectedPagesChange: (pages: number[]) => void
  maxPages?: number
  onClose?: () => void
}

export function PageSelector({
  file,
  totalPages,
  selectedPages,
  onSelectedPagesChange,
  maxPages = 5,
  onClose,
}: PageSelectorProps) {
  const [localSelection, setLocalSelection] = useState<number[]>(selectedPages)
  
  // Sync local selection with prop
  useEffect(() => {
    setLocalSelection(selectedPages)
  }, [selectedPages])
  
  // Toggle page selection
  const togglePage = useCallback((pageNum: number) => {
    setLocalSelection(prev => {
      if (prev.includes(pageNum)) {
        return prev.filter(p => p !== pageNum)
      } else {
        // Check max limit
        if (prev.length >= maxPages) {
          return prev
        }
        return [...prev, pageNum].sort((a, b) => a - b)
      }
    })
  }, [maxPages])
  
  // Apply selection
  const applySelection = useCallback(() => {
    onSelectedPagesChange(localSelection)
    onClose?.()
  }, [localSelection, onSelectedPagesChange, onClose])
  
  // Clear selection
  const clearSelection = useCallback(() => {
    setLocalSelection([])
  }, [])
  
  const isOverLimit = localSelection.length >= maxPages
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-bg-secondary">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Select Pages</h3>
          <p className="text-xs text-text-muted">
            {localSelection.length}/{maxPages} pages selected
            {isOverLimit && ' (max reached)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {localSelection.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-7 text-xs text-text-secondary hover:text-text-primary"
            >
              Clear all
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Page Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <Document file={file} loading="">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              const isSelected = localSelection.includes(pageNum)
              const wouldExceedLimit = !isSelected && isOverLimit
              
              return (
                <button
                  key={pageNum}
                  onClick={() => !wouldExceedLimit && togglePage(pageNum)}
                  disabled={wouldExceedLimit}
                  className={`
                    relative rounded-lg overflow-hidden border-2 transition-all
                    ${isSelected 
                      ? 'border-accent bg-accent/10' 
                      : wouldExceedLimit
                        ? 'border-transparent opacity-50 cursor-not-allowed'
                        : 'border-transparent hover:border-border-strong'
                    }
                  `}
                >
                  {/* Page Thumbnail */}
                  <Page
                    pageNumber={pageNum}
                    scale={0.15}
                    className="mx-auto"
                    loading={
                      <div className="w-full aspect-[3/4] bg-bg-tertiary animate-pulse" />
                    }
                  />
                  
                  {/* Page Number */}
                  <div className="absolute bottom-0 left-0 right-0 bg-bg-primary/80 text-center py-1">
                    <span className="text-xs font-medium text-text-secondary">
                      {pageNum}
                    </span>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Document>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border bg-bg-secondary">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-text-muted">
            {localSelection.length > 0 ? (
              <span>Pages: {localSelection.join(', ')}</span>
            ) : (
              <span>No pages selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={applySelection}
              disabled={localSelection.length === 0}
              className="h-8 bg-accent hover:bg-accent-hover text-white"
            >
              Apply ({localSelection.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
