import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { PDFViewer } from '@/components/viewer/PDFViewer'
import { PageSelector } from '@/components/viewer/PageSelector'
import { ResizablePanel } from '@/components/ui/resizable'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { CollapsibleChatInput } from '@/components/ui/collapsible-chat-input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  ArrowLeft, FileText, MessageSquare, Loader2, X, 
  Layers, ChevronDown, ChevronUp
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { apiEndpoint } from '@/lib/config'

interface Document {
  id: string
  title: string
  content: string
  filename: string
  fileType: string
  filePath?: string
  fileUrl?: string
  fileKey?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  pageNumber?: number
  selectedPages?: number[]
}

const MAX_SELECTED_PAGES = 5

export function PDFViewerPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuthStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [showPageSelector, setShowPageSelector] = useState(false)
  
  // Page context - combined to avoid race conditions
  const [pageContext, setPageContext] = useState<{
    pageNumber: number;
    content: string;
  } | null>(null)
   
  // Chat state
  const [showChat, setShowChat] = useState(true) // Start with chat open
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  
  // Refs
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  
  const { toast } = useToast()

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages])

  // Fetch document
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id || !token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(apiEndpoint(`api/documents/${id}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setDocument(data.document)
          
          // If document has a fileUrl (Vercel Blob), use it directly
          if (data.document.fileUrl) {
            try {
              const fileResponse = await fetch(data.document.fileUrl)
              if (fileResponse.ok) {
                const blob = await fileResponse.blob()
                setPdfBlob(blob)
              } else {
                console.error('Failed to fetch PDF from Blob:', fileResponse.status)
              }
            } catch (fileError) {
              console.error('Error fetching PDF from Blob:', fileError)
            }
          } 
          // Fallback: If document has a filePath (legacy local storage), fetch via API
          else if (data.document.filePath) {
            try {
              const fileResponse = await fetch(apiEndpoint(`api/documents/${id}/file`), {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
              })
              
              if (fileResponse.ok) {
                const blob = await fileResponse.blob()
                setPdfBlob(blob)
              } else {
                console.error('Failed to fetch PDF file:', fileResponse.status)
              }
            } catch (fileError) {
              console.error('Error fetching PDF file:', fileError)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching document:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [id, token])

  // Handle text selection from PDF
  const handleTextSelect = useCallback((text: string) => {
    setSelectedText(text)
  }, [])

  // Handle page content extraction - combined with page number
  const handlePageContent = useCallback((content: string, page: number) => {
    setPageContext({ pageNumber: page, content })
  }, [])

  // Handle page change from PDF viewer
  const handlePageChange = useCallback((_page: number, total: number) => {
    setTotalPages(total)
    // Note: page content will be updated separately via handlePageContent
  }, [])

  // Get user's language preference
  const getLanguagePreference = () => {
    const lang = localStorage.getItem('i18nextLng') || 'en'
    return lang === 'pt-PT' ? 'Portuguese' : 'English'
  }

  // Chat with AI
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    const currentPageNumber = pageContext?.pageNumber || 1
    const currentPageContent = pageContext?.content || ''
    
    setChatInput('')
    setChatMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      pageNumber: currentPageNumber,
      selectedPages: selectedPages.length > 0 ? [...selectedPages] : undefined
    }])
    setIsChatLoading(true)

    try {
      const response = await fetch(apiEndpoint(`api/ai/documents/${id}/chat`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          selectedText,
          pageContent: currentPageContent,
          pageNumber: currentPageNumber,
          selectedPages: selectedPages.length > 0 ? selectedPages : undefined,
          language: getLanguagePreference(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
        setSelectedText('')
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
      })
      // Remove the failed user message
      setChatMessages(prev => prev.slice(0, -1))
    } finally {
      setIsChatLoading(false)
    }
  }

  // Handle page selection
  const handlePageSelectionChange = useCallback((pages: number[]) => {
    setSelectedPages(pages.slice(0, MAX_SELECTED_PAGES))
  }, [])

  // Clear page selection
  const clearPageSelection = useCallback(() => {
    setSelectedPages([])
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="h-screen bg-bg-primary p-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/documents">
            <Button variant="ghost" size="sm" className="mb-6 text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </Link>
          <div className="text-center py-24 bg-bg-secondary border border-border rounded-xl">
            <FileText className="w-16 h-16 mx-auto text-text-muted mb-4" />
            <h2 className="text-xl font-semibold text-text-primary">Document not found</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Header - Fixed height h-12 */}
      <div className="h-12 border-b border-border bg-bg-secondary px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/documents/${id}`}>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary h-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="max-w-md">
            <h1 className="font-medium text-text-primary truncate text-sm">{document.title}</h1>
            <p className="text-xs text-text-muted truncate">{document.filename}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm" 
            className="text-text-secondary hover:text-text-primary h-8"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showChat ? 'Hide' : 'Chat'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {pdfBlob ? (
            <PDFViewer
              file={pdfBlob}
              onTextSelect={handleTextSelect}
              onPageContent={handlePageContent}
              onPageChange={handlePageChange}
              selectedPages={selectedPages}
              onSelectedPagesChange={handlePageSelectionChange}
              className="flex-1"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-bg-tertiary">
              <FileText className="w-16 h-16 text-text-muted mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No PDF File</h3>
              <p className="text-text-secondary text-center max-w-md mb-4">
                This document doesn't have an associated PDF file. 
                The content may have been pasted as text.
              </p>
              {document.content && (
                <div className="w-full max-w-2xl bg-bg-secondary border border-border rounded-xl p-6 max-h-96 overflow-auto">
                  <h4 className="text-sm font-medium text-text-muted mb-3">Document Contents:</h4>
                  <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
                    {document.content.slice(0, 2000)}
                    {document.content.length > 2000 && '...'}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Status Bar - Fixed height h-12, aligned with toolbar */}
          <div className="h-12 border-t border-border bg-bg-secondary px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Page Selection Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-text-secondary hover:text-text-primary"
                onClick={() => setShowPageSelector(!showPageSelector)}
              >
                <Layers className="w-4 h-4 mr-2" />
                Select Pages
                {selectedPages.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-accent text-white text-xs rounded-full">
                    {selectedPages.length}
                  </span>
                )}
                {showPageSelector ? (
                  <ChevronUp className="w-3 h-3 ml-1" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-1" />
                )}
              </Button>
              
              {/* Selected Pages Display */}
              {selectedPages.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">
                    Pages: {selectedPages.join(', ')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-text-muted hover:text-text-primary"
                    onClick={clearPageSelection}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
            
            {/* Page Indicator */}
            <div className="text-sm text-text-muted">
              Page {pageContext?.pageNumber || 1} of {totalPages || '?'}
            </div>
          </div>
          
          {/* Page Selector Dropdown */}
          <AnimatePresence>
            {showPageSelector && pdfBlob && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border bg-bg-secondary overflow-hidden"
                style={{ maxHeight: '300px' }}
              >
                <PageSelector
                  file={pdfBlob}
                  totalPages={totalPages}
                  selectedPages={selectedPages}
                  onSelectedPagesChange={handlePageSelectionChange}
                  maxPages={MAX_SELECTED_PAGES}
                  onClose={() => setShowPageSelector(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <ResizablePanel
              defaultWidth={420}
              minWidth={350}
              maxWidth={600}
              side="right"
              className="border-l border-border bg-bg-secondary flex flex-col"
            >
              {/* Chat Header - Fixed height h-12 */}
              <div className="h-12 px-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Chat</h3>
                  <p className="text-xs text-text-muted">
                    {selectedPages.length > 0 
                      ? `${selectedPages.length} pages selected`
                      : `Page ${pageContext?.pageNumber || 1}`
                    }
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-text-muted hover:text-text-primary"
                  onClick={() => setShowChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected Text Context */}
              {selectedText && (
                <div className="p-3 border-b border-border bg-accent-light/30">
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Selected Text</h4>
                  <p className="text-sm text-text-secondary line-clamp-2">{selectedText}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs text-accent"
                    onClick={() => {
                      setChatInput(prev => prev + (prev ? ' ' : '') + `Regarding "${selectedText.slice(0, 50)}${selectedText.length > 50 ? '...' : ''}", `)
                    }}
                  >
                    Ask about this
                  </Button>
                </div>
              )}

              {/* Chat Messages - Scrollable */}
              <div 
                ref={chatMessagesRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
              >
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-text-muted mb-3" />
                    <p className="text-text-secondary text-sm mb-2">Ask questions about this document</p>
                    <p className="text-text-muted text-xs">
                      Navigate to a page or select text to provide context
                    </p>
                  </div>
                )}
                
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-accent text-white'
                          : 'bg-bg-tertiary text-text-primary'
                      }`}
                    >
                      {message.role === 'user' && (message.pageNumber || message.selectedPages) && (
                        <div className="text-xs opacity-70 mb-1">
                          {message.selectedPages && message.selectedPages.length > 0 
                            ? `Pages: ${message.selectedPages.join(', ')}`
                            : message.pageNumber && `Page ${message.pageNumber}`
                          }
                        </div>
                      )}
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <MarkdownRenderer content={message.content} className="text-sm" />
                      )}
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-bg-tertiary rounded-lg px-3 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input - Fixed at bottom with collapsible input */}
              <div className="border-t border-border">
                <CollapsibleChatInput
                  value={chatInput}
                  onChange={setChatInput}
                  onSend={handleSendMessage}
                  placeholder={`Ask about ${selectedPages.length > 0 ? `${selectedPages.length} selected pages` : `page ${pageContext?.pageNumber || 1}`}...`}
                  disabled={false}
                  isLoading={isChatLoading}
                  maxRows={15}
                />
              </div>
            </ResizablePanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
