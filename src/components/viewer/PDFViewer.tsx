import { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FileText, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { PDFToolbar, ViewMode } from './PDFToolbar'
import { PDFContinuousView } from './PDFContinuousView'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  file: string | Blob | File
  viewMode?: ViewMode
  onTextSelect?: (text: string) => void
  onPageChange?: (page: number, totalPages: number) => void
  onPageContent?: (content: string, page: number) => void
  selectedPages?: number[]
  onSelectedPagesChange?: (pages: number[]) => void
  className?: string
}

export function PDFViewer({ 
  file, 
  viewMode: initialViewMode = 'single',
  onTextSelect, 
  onPageChange,
  onPageContent,
  selectedPages: _selectedPages,
  onSelectedPagesChange: _onSelectedPagesChange,
  className = '' 
}: PDFViewerProps) {
  // State
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  
  // Refs
  const pdfDocRef = useRef<any>(null)
  const singlePageContainerRef = useRef<HTMLDivElement>(null)

  // Load view mode preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('pdf-view-mode') as ViewMode | null
    if (savedViewMode && ['single', 'continuous', 'spread'].includes(savedViewMode)) {
      setViewMode(savedViewMode)
    }
  }, [])

  // Save view mode preference
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('pdf-view-mode', mode)
  }, [])

  // Handle document load success
  const onDocumentLoadSuccess = useCallback((pdf: any) => {
    setNumPages(pdf.numPages)
    setLoading(false)
    onPageChange?.(1, pdf.numPages)
    pdfDocRef.current = pdf
  }, [onPageChange])

  // Handle document load error
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF. Please try again.')
    setLoading(false)
  }, [])

  // Extract text content from a page
  const extractPageText = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current) return ''
    
    try {
      const page = await pdfDocRef.current.getPage(pageNum)
      const textContent = await page.getTextContent()
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      return text
    } catch (error) {
      console.error('Error extracting page text:', error)
      return ''
    }
  }, [])

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    // In spread mode, ensure we're on an odd page (left side of spread)
    let targetPage = page
    if (viewMode === 'spread' && page % 2 === 0 && page > 1) {
      targetPage = page - 1
    }
    
    if (targetPage >= 1 && targetPage <= numPages) {
      setCurrentPage(targetPage)
      onPageChange?.(targetPage, numPages)
      
      // Extract text from new page if callback is provided
      if (onPageContent && pdfDocRef.current) {
        extractPageText(targetPage).then(text => {
          if (text) {
            onPageContent(text, targetPage)
          }
        })
      }
    }
  }, [numPages, onPageChange, onPageContent, extractPageText, viewMode])

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    if (!onTextSelect) return
    
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (text && text.length > 0) {
      onTextSelect(text)
    }
  }, [onTextSelect])

  // Scroll to page in continuous mode
  const scrollToPage = useCallback((page: number) => {
    if (viewMode === 'continuous') {
      const pageElement = document.querySelector(`[data-page="${page}"]`)
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [viewMode])

  // Combined page change handler
  const handlePageChangeWithScroll = useCallback((page: number) => {
    handlePageChange(page)
    if (viewMode === 'continuous') {
      scrollToPage(page)
    }
  }, [handlePageChange, viewMode, scrollToPage])

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <FileText className="w-16 h-16 text-text-muted mb-4" />
        <p className="text-text-secondary mb-2">{error}</p>
        <p className="text-sm text-text-muted">The PDF might be corrupted or unavailable.</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <PDFToolbar
        currentPage={currentPage}
        totalPages={numPages}
        scale={scale}
        viewMode={viewMode}
        onPageChange={handlePageChangeWithScroll}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onViewModeChange={handleViewModeChange}
      />

      {/* PDF Content */}
      {viewMode === 'continuous' ? (
        <PDFContinuousView
          file={file}
          scale={scale}
          onTextSelect={onTextSelect}
          onPageChange={onPageChange}
          onPageContent={onPageContent}
          onLoadSuccess={(numPages) => {
            setNumPages(numPages)
            setLoading(false)
          }}
          onLoadError={onDocumentLoadError}
          className="flex-1"
        />
      ) : viewMode === 'spread' ? (
        // Two-Page Spread View
        <div 
          ref={singlePageContainerRef}
          className="flex-1 overflow-auto bg-bg-tertiary p-4 scrollbar-thin"
          onMouseUp={handleMouseUp}
        >
          <div className="flex justify-center min-h-full gap-2">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                <p className="text-text-secondary">Loading PDF...</p>
              </div>
            )}
            
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: loading ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center min-h-full gap-2"
              >
                {/* Left page (odd page number) */}
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  className="shadow-lg"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={
                    <div className="flex items-center justify-center w-[600px] h-[800px] bg-bg-secondary rounded">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                  }
                />
                {/* Right page (even page number) - only show if exists */}
                {currentPage + 1 <= numPages && (
                  <Page
                    pageNumber={currentPage + 1}
                    scale={scale}
                    className="shadow-lg"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    loading={
                      <div className="flex items-center justify-center w-[600px] h-[800px] bg-bg-secondary rounded">
                        <Loader2 className="w-6 h-6 animate-spin text-accent" />
                      </div>
                    }
                  />
                )}
              </motion.div>
            </Document>
          </div>
        </div>
      ) : (
        // Single Page View
        <div 
          ref={singlePageContainerRef}
          className="flex-1 overflow-auto bg-bg-tertiary p-4 scrollbar-thin"
          onMouseUp={handleMouseUp}
        >
          <div className="flex justify-center min-h-full">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                <p className="text-text-secondary">Loading PDF...</p>
              </div>
            )}
            
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: loading ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center min-h-full"
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  className="shadow-lg"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={
                    <div className="flex items-center justify-center w-[600px] h-[800px] bg-bg-secondary">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                  }
                />
              </motion.div>
            </Document>
          </div>
        </div>
      )}
    </div>
  )
}

// Thumbnail view for sidebar
interface PDFThumbnailsProps {
  file: string | Blob | File
  currentPage: number
  onPageSelect: (page: number) => void
  selectedPages?: number[]
  showSelection?: boolean
}

export function PDFThumbnails({ 
  file, 
  currentPage, 
  onPageSelect,
  selectedPages = [],
  showSelection = false
}: PDFThumbnailsProps) {
  const [numPages, setNumPages] = useState<number>(0)

  return (
    <div className="space-y-2 p-2">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from(new Array(numPages), (_, index) => {
          const pageNum = index + 1
          const isSelected = selectedPages.includes(pageNum)
          const isCurrentPage = currentPage === pageNum
          
          return (
            <button
              key={`thumbnail-${pageNum}`}
              onClick={() => onPageSelect(pageNum)}
              className={`w-full rounded overflow-hidden transition-all relative ${
                isCurrentPage
                  ? 'ring-2 ring-accent'
                  : 'hover:ring-2 hover:ring-border-strong'
              } ${isSelected && showSelection ? 'bg-accent/20' : ''}`}
            >
              <Page
                pageNumber={pageNum}
                scale={0.2}
                className="mx-auto"
              />
              <span className="block text-xs text-center text-text-muted py-1">
                {pageNum}
              </span>
              {isSelected && showSelection && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </Document>
    </div>
  )
}

// Re-export types
export type { ViewMode }
