import { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Check, X, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface ChatPageSelectorProps {
  totalPages: number
  selectedPages: number[]
  onSelectionChange: (pages: number[]) => void
  file: string | Blob | File
  className?: string
}

export function ChatPageSelector({
  totalPages,
  selectedPages,
  onSelectionChange,
  file,
  className = ''
}: ChatPageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localSelection, setLocalSelection] = useState<Set<number>>(new Set(selectedPages))

  // Sync local selection with prop
  useEffect(() => {
    setLocalSelection(new Set(selectedPages))
  }, [selectedPages])

  // Toggle page selection
  const togglePage = useCallback((pageNum: number) => {
    setLocalSelection(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageNum)) {
        newSet.delete(pageNum)
      } else {
        newSet.add(pageNum)
      }
      return newSet
    })
  }, [])

  // Select all pages
  const selectAll = useCallback(() => {
    setLocalSelection(new Set(Array.from({ length: totalPages }, (_, i) => i + 1)))
  }, [totalPages])

  // Clear selection
  const clearSelection = useCallback(() => {
    setLocalSelection(new Set())
  }, [])

  // Apply selection
  const applySelection = useCallback(() => {
    onSelectionChange(Array.from(localSelection).sort((a, b) => a - b))
    setIsOpen(false)
  }, [localSelection, onSelectionChange])

  // Cancel selection
  const cancelSelection = useCallback(() => {
    setLocalSelection(new Set(selectedPages))
    setIsOpen(false)
  }, [selectedPages])

  return (
    <div className={className}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          selectedPages.length > 0
            ? 'bg-accent/10 border-accent text-accent'
            : 'bg-bg-secondary border-border text-text-secondary hover:text-text-primary'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span className="text-sm">
          {selectedPages.length > 0 
            ? `${selectedPages.length} page${selectedPages.length > 1 ? 's' : ''} selected`
            : 'Select pages'
          }
        </span>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-80 bg-bg-secondary border border-border rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-medium text-text-primary">Select Pages for Context</h3>
              <button
                onClick={cancelSelection}
                className="w-6 h-6 rounded-md hover:bg-bg-tertiary flex items-center justify-center text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-bg-tertiary">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-xs h-7"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-xs h-7"
              >
                Clear
              </Button>
              <div className="flex-1" />
              <span className="text-xs text-text-muted">
                {localSelection.size} selected
              </span>
            </div>

            {/* Page Grid */}
            <div className="max-h-64 overflow-auto p-3">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNum = i + 1
                  const isSelected = localSelection.has(pageNum)
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => togglePage(pageNum)}
                      className={`relative aspect-[3/4] rounded-lg border-2 transition-all overflow-hidden ${
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-border-strong bg-bg-tertiary'
                      }`}
                    >
                      {/* Page Thumbnail */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Document file={file} loading="">
                          <Page
                            pageNumber={pageNum}
                            scale={0.1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="opacity-50"
                          />
                        </Document>
                      </div>
                      
                      {/* Page Number */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-1">
                        <span className="text-xs text-white font-medium">{pageNum}</span>
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-bg-tertiary">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelSelection}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={applySelection}
                className="bg-accent hover:bg-accent-hover text-white"
              >
                Apply ({localSelection.size})
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
