import { useState, useCallback, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Loader2, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFContinuousViewProps {
  file: string | Blob | File
  scale: number
  onTextSelect?: (text: string) => void
  onPageChange?: (page: number, totalPages: number) => void
  onPageContent?: (content: string, page: number) => void
  onLoadSuccess?: (numPages: number) => void
  onLoadError?: (error: Error) => void
  className?: string
}

export function PDFContinuousView({
  file,
  scale,
  onTextSelect,
  onPageChange,
  onPageContent,
  onLoadSuccess,
  onLoadError,
  className = ''
}: PDFContinuousViewProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([1]))
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const pdfDocRef = useRef<any>(null)

  // Handle document load
  const handleDocumentLoadSuccess = useCallback((pdf: any) => {
    setNumPages(pdf.numPages)
    setLoading(false)
    pdfDocRef.current = pdf
    onLoadSuccess?.(pdf.numPages)
  }, [onLoadSuccess])

  // Handle document load error
  const handleDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF. Please try again.')
    setLoading(false)
    onLoadError?.(error)
  }, [onLoadError])

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

  // Track visible pages using Intersection Observer
  useEffect(() => {
    if (!containerRef.current || numPages === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const newVisiblePages = new Set(visiblePages)
        
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.getAttribute('data-page') || '0', 10)
          if (pageNum > 0) {
            if (entry.isIntersecting) {
              newVisiblePages.add(pageNum)
            } else {
              // Keep pages that are near the viewport for smoother scrolling
              const ratio = entry.intersectionRatio
              if (ratio < 0.1) {
                newVisiblePages.delete(pageNum)
              }
            }
          }
        })

        setVisiblePages(newVisiblePages)

        // Find the most visible page and notify
        const mostVisiblePage = Array.from(newVisiblePages).sort((a, b) => a - b)[0]
        if (mostVisiblePage && mostVisiblePage > 0) {
          onPageChange?.(mostVisiblePage, numPages)
          
          // Extract text for the visible page
          if (onPageContent) {
            extractPageText(mostVisiblePage).then(text => {
              if (text) onPageContent(text, mostVisiblePage)
            })
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: '100px',
        threshold: [0, 0.1, 0.5, 1]
      }
    )

    // Observe all page elements
    pageRefs.current.forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [numPages, visiblePages, onPageChange, onPageContent, extractPageText])

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    if (!onTextSelect) return
    
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (text && text.length > 0) {
      onTextSelect(text)
    }
  }, [onTextSelect])

  // Register page ref
  const registerPageRef = useCallback((pageNum: number) => (el: HTMLDivElement | null) => {
    if (el) {
      pageRefs.current.set(pageNum, el)
    } else {
      pageRefs.current.delete(pageNum)
    }
  }, [])

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
    <div 
      ref={containerRef}
      className={`overflow-auto bg-bg-tertiary ${className}`}
      onMouseUp={handleMouseUp}
    >
      <div className="flex flex-col items-center py-4 gap-4 min-h-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
            <p className="text-text-secondary">Loading PDF...</p>
          </div>
        )}

        <Document
          file={file}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading=""
        >
          {Array.from({ length: numPages }, (_, index) => {
            const pageNum = index + 1
            const isVisible = visiblePages.has(pageNum)
            
            return (
              <motion.div
                key={`page-${pageNum}`}
                ref={registerPageRef(pageNum)}
                data-page={pageNum}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible || loading ? 1 : 0.3, y: 0 }}
                transition={{ duration: 0.3, delay: isVisible ? 0 : 0.1 }}
                className="bg-white shadow-lg"
              >
                <Page
                  pageNumber={pageNum}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={
                    <div className="flex items-center justify-center w-[600px] h-[800px] bg-bg-secondary">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                  }
                />
                {/* Page number indicator */}
                <div className="text-center py-2 bg-bg-secondary text-text-muted text-sm border-t border-border">
                  Page {pageNum} of {numPages}
                </div>
              </motion.div>
            )
          })}
        </Document>
      </div>
    </div>
  )
}
