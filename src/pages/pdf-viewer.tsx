import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PDFViewer } from '@/components/viewer/PDFViewer'
import { ChatPageSelector } from '@/components/chat/ChatPageSelector'
import { ResizablePanel } from '@/components/ui/resizable'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { 
  ArrowLeft, FileText, MessageSquare, Sparkles, BookOpen, 
  Send, Loader2, Lightbulb, Target, X, AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AnimatePresence } from 'framer-motion'
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

interface Exercise {
  type: 'multiple_choice' | 'fill_blank' | 'short_answer'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function PDFViewerPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuthStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageContent, setPageContent] = useState('')
  const [selectedPages, setSelectedPages] = useState<number[]>([])
   
  // Chat state
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  
  // AI Tools state
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState('')
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  
  const [showExercises, setShowExercises] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isExercisesLoading, setIsExercisesLoading] = useState(false)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({})
  const [showExerciseResults, setShowExerciseResults] = useState<Record<number, boolean>>({})
  
  const { toast } = useToast()

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
            // Vercel Blob URLs are public, so we can fetch directly
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

  // Handle page content extraction
  const handlePageContent = useCallback((content: string, page: number) => {
    setPageContent(content)
    setCurrentPage(page)
  }, [])

  // Handle page change from PDF viewer
  const handlePageChange = useCallback((page: number, total: number) => {
    setCurrentPage(page)
    setTotalPages(total)
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
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
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
          pageContent,
          pageNumber: currentPage,
          selectedPages,
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
    } finally {
      setIsChatLoading(false)
    }
  }

  // Summarize document
  const handleSummarize = async () => {
    // Check if document has content
    if (!document?.content) {
      toast({
        variant: 'destructive',
        title: 'No Content',
        description: 'This document has no text content to summarize.',
      })
      return
    }

    setShowSummary(true)
    setIsSummaryLoading(true)
    setSummary('')

    try {
      const response = await fetch(apiEndpoint(`api/ai/documents/${id}/summarize`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          content: document.content,
          language: getLanguagePreference(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSummary(data.summary)
      } else {
        throw new Error(data.error || `Failed to generate summary (${response.status})`)
      }
    } catch (error) {
      console.error('Summarize error:', error)
      toast({
        variant: 'destructive',
        title: 'Summarize Error',
        description: error instanceof Error ? error.message : 'Failed to generate summary',
      })
      setShowSummary(false)
    } finally {
      setIsSummaryLoading(false)
    }
  }

  // Generate exercises
  const handleGenerateExercises = async () => {
    // Check if document has content
    if (!document?.content) {
      toast({
        variant: 'destructive',
        title: 'No Content',
        description: 'This document has no text content to generate exercises from.',
      })
      return
    }

    setShowExercises(true)
    setIsExercisesLoading(true)
    setExercises([])
    setExerciseAnswers({})
    setShowExerciseResults({})

    try {
      const response = await fetch(apiEndpoint(`api/ai/documents/${id}/exercises`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          content: document.content,
          language: getLanguagePreference(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setExercises(data.exercises || [])
      } else {
        throw new Error(data.error || `Failed to generate exercises (${response.status})`)
      }
    } catch (error) {
      console.error('Exercises error:', error)
      toast({
        variant: 'destructive',
        title: 'Exercises Error',
        description: error instanceof Error ? error.message : 'Failed to generate exercises',
      })
      setShowExercises(false)
    } finally {
      setIsExercisesLoading(false)
    }
  }

  // Check exercise answer
  const checkAnswer = (index: number) => {
    setShowExerciseResults(prev => ({ ...prev, [index]: true }))
  }

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
      {/* Header */}
      <div className="border-b border-border bg-bg-secondary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/documents/${id}`}>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="font-medium text-text-primary truncate max-w-md">{document.title}</h1>
            <p className="text-xs text-text-muted">{document.filename}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-text-secondary hover:text-text-primary"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Link to={`/learn/${id}`}>
            <Button 
              size="sm" 
              className="bg-accent hover:bg-accent-hover text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Learning Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          {pdfBlob ? (
            <PDFViewer
              file={pdfBlob}
              onTextSelect={handleTextSelect}
              onPageContent={handlePageContent}
              onPageChange={handlePageChange}
              selectedPages={selectedPages}
              onSelectedPagesChange={setSelectedPages}
              className="h-full"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-bg-tertiary">
              <FileText className="w-16 h-16 text-text-muted mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No PDF File</h3>
              <p className="text-text-secondary text-center max-w-md mb-4">
                This document doesn't have an associated PDF file. 
                The content may have been pasted as text.
              </p>
              {document.content && (
                <div className="w-full max-w-2xl bg-bg-secondary border border-border rounded-xl p-6 max-h-96 overflow-auto">
                  <h4 className="text-sm font-medium text-text-muted mb-3">Document Content:</h4>
                  <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
                    {document.content.slice(0, 2000)}
                    {document.content.length > 2000 && '...'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Sidebar */}
        <AnimatePresence>
          {showChat && (
            <ResizablePanel
              defaultWidth={420}
              minWidth={350}
              maxWidth={600}
              side="right"
              className="border-l border-border bg-bg-secondary"
            >
              {/* AI Tools */}
              <div className="p-4 border-b border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">AI Tools</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-text-muted hover:text-text-primary"
                    onClick={() => setShowChat(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start border-border hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                    onClick={handleSummarize}
                    disabled={isSummaryLoading || !document?.content}
                  >
                    {isSummaryLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <BookOpen className="w-4 h-4 mr-2" />
                    )}
                    Summarize
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start border-border hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                    onClick={handleGenerateExercises}
                    disabled={isExercisesLoading || !document?.content}
                  >
                    {isExercisesLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    Exercises
                  </Button>
                </div>
                {!document?.content && (
                  <div className="flex items-center gap-2 p-2 bg-warning-light rounded-lg text-warning text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>No text content available for AI features</span>
                  </div>
                )}
              </div>

              {/* Summary Panel */}
              {showSummary && (
                <div className="border-b border-border p-4 max-h-72 overflow-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-text-primary flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Summary
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-text-muted hover:text-text-primary"
                      onClick={() => setShowSummary(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {isSummaryLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
                    </div>
                  ) : (
                    <MarkdownRenderer content={summary} className="text-sm" />
                  )}
                </div>
              )}

              {/* Exercises Panel */}
              {showExercises && (
                <div className="border-b border-border p-4 max-h-96 overflow-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-text-primary flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-accent" />
                      Exercises
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-text-muted hover:text-text-primary"
                      onClick={() => setShowExercises(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {isExercisesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {exercises.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-4">No exercises generated</p>
                      ) : (
                        exercises.map((exercise, index) => (
                          <div key={index} className="p-3 border border-border rounded-lg bg-bg-tertiary space-y-2">
                            <p className="text-sm font-medium text-text-primary">{index + 1}. {exercise.question}</p>
                            
                            {exercise.type === 'multiple_choice' && exercise.options && (
                              <div className="space-y-1">
                                {exercise.options.map((option, optIndex) => (
                                  <label 
                                    key={optIndex} 
                                    className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary"
                                  >
                                    <input
                                      type="radio"
                                      name={`exercise-${index}`}
                                      value={option}
                                      onChange={() => setExerciseAnswers(prev => ({ ...prev, [index]: option }))}
                                      className="w-4 h-4 text-accent"
                                    />
                                    {option}
                                  </label>
                                ))}
                              </div>
                            )}
                            
                            {exercise.type === 'fill_blank' && (
                              <Input
                                placeholder="Fill in the blank..."
                                value={exerciseAnswers[index] || ''}
                                onChange={(e) => setExerciseAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                className="text-sm border-border bg-bg-secondary"
                              />
                            )}
                            
                            {exercise.type === 'short_answer' && (
                              <Input
                                placeholder="Your answer..."
                                value={exerciseAnswers[index] || ''}
                                onChange={(e) => setExerciseAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                className="text-sm border-border bg-bg-secondary"
                              />
                            )}
                            
                            <div className="flex items-center gap-2 pt-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-border text-text-secondary hover:text-text-primary"
                                onClick={() => checkAnswer(index)}
                                disabled={!exerciseAnswers[index]}
                              >
                                Check
                              </Button>
                              
                              {showExerciseResults[index] && (
                                <div className="text-sm">
                                  {exerciseAnswers[index]?.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim() ? (
                                    <span className="text-success">✓ Correct!</span>
                                  ) : (
                                    <span className="text-error">
                                      ✗ Answer: {exercise.correctAnswer}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Text */}
              {selectedText && (
                <div className="p-4 border-b border-border bg-accent-light/30">
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Selected Text</h4>
                  <p className="text-sm text-text-secondary line-clamp-3">{selectedText}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs text-accent"
                    onClick={() => {
                      setChatInput(prev => prev + (prev ? ' ' : '') + `Regarding "${selectedText.slice(0, 50)}...", `)
                    }}
                  >
                    Ask about this
                  </Button>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-text-muted mb-3" />
                    <p className="text-text-secondary text-sm">Ask questions about this document</p>
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

              {/* Chat Input */}
              <div className="p-4 border-t border-border">
                {/* Page Selector */}
                {pdfBlob && totalPages > 0 && (
                  <div className="mb-3 relative">
                    <ChatPageSelector
                      totalPages={totalPages}
                      selectedPages={selectedPages}
                      onSelectionChange={setSelectedPages}
                      file={pdfBlob}
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="border-border bg-bg-tertiary"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="bg-accent hover:bg-accent-hover text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </ResizablePanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
