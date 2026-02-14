import { useState, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  file: string | Blob | File
  onTextSelect?: (text: string) => void
  onPageChange?: (page: number, totalPages: number) => void
  onPageContent?: (content: string, page: number) => void
  className?: string
}

export function PDFViewer({ 
  file, 
  onTextSelect, 
  onPageChange,
  onPageContent,
  className = '' 
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const pdfDocRef = useRef<any>(null)

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    onPageChange?.(1, numPages)
    pdfDocRef.current = null // Will be set when we need to extract text
  }, [onPageChange])

  // Extract text content from current page
  const extractPageText = useCallback(async (pageNum: number, pdfDoc: any) => {
    try {
      const page = await pdfDoc.getPage(pageNum)
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

  // Handle page change and extract text
  const handlePageChange = useCallback((page: number, total: number) => {
    setCurrentPage(page)
    onPageChange?.(page, total)
    
    // Extract text from new page if callback is provided
    if (onPageContent && pdfDocRef.current) {
      extractPageText(page, pdfDocRef.current).then(text => {
        if (text) {
          onPageContent(text, page)
        }
      })
    }
  }, [onPageChange, onPageContent, extractPageText])

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF. Please try again.')
    setLoading(false)
  }, [])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= numPages) {
      handlePageChange(page, numPages)
    }
  }, [numPages, handlePageChange])

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
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-text-secondary font-mono min-w-[80px] text-center">
            {currentPage} / {numPages || '...'}
          </span>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-text-secondary font-mono min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="w-8 h-8 rounded-lg hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        className="flex-1 overflow-auto bg-bg-tertiary p-4 scrollbar-thin"
        onMouseUp={handleMouseUp}
      >
        <div className="flex justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
              <p className="text-text-secondary">Loading PDF...</p>
            </div>
          )}
          
          <Document
            file={file}
            onLoadSuccess={(pdf) => {
              pdfDocRef.current = pdf
              onDocumentLoadSuccess({ numPages: pdf.numPages })
            }}
            onLoadError={onDocumentLoadError}
            loading=""
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: loading ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                className="shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </motion.div>
          </Document>
        </div>
      </div>
    </div>
  )
}

// Thumbnail view for sidebar
interface PDFThumbnailsProps {
  file: string | Blob | File
  currentPage: number
  onPageSelect: (page: number) => void
}

export function PDFThumbnails({ file, currentPage, onPageSelect }: PDFThumbnailsProps) {
  const [numPages, setNumPages] = useState<number>(0)

  return (
    <div className="space-y-2 p-2">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <button
            key={`thumbnail-${index + 1}`}
            onClick={() => onPageSelect(index + 1)}
            className={`w-full rounded overflow-hidden transition-all ${
              currentPage === index + 1
                ? 'ring-2 ring-accent'
                : 'hover:ring-2 hover:ring-border-strong'
            }`}
          >
            <Page
              pageNumber={index + 1}
              scale={0.2}
              className="mx-auto"
            />
            <span className="block text-xs text-center text-text-muted py-1">
              {index + 1}
            </span>
          </button>
        ))}
      </Document>
    </div>
  )
}
