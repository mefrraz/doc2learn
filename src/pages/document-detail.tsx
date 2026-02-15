import { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, FileText, HelpCircle, List, Sparkles, Loader2, Eye, Send, MessageSquare } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { apiEndpoint } from '@/lib/config'
import type { Document } from '@/lib/types'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuthStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  
  // Document chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

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
      }
    } catch (error) {
      console.error('Error fetching document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocument()
  }, [id, token])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleGenerateContent = async () => {
    if (!id || !token) return

    setIsGenerating(true)

    try {
      const response = await fetch(apiEndpoint(`api/documents/${id}/generate`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      toast({
        title: 'Content Generated!',
        description: `Created ${data.generated?.quizCount || 0} quiz questions, ${data.generated?.glossaryCount || 0} glossary terms, and more.`,
      })

      // Refresh document
      fetchDocument()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate content',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Get user's language preference
  const getLanguagePreference = () => {
    const lang = localStorage.getItem('i18nextLng') || 'en'
    return lang === 'pt-PT' ? 'Portuguese' : 'English'
  }

  // Document chat handler
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading || !id || !token) return

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
          language: getLanguagePreference(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-6 lg:p-8">
        <Link to="/documents">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Button>
        </Link>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Document not found</h2>
        </div>
      </div>
    )
  }

  const hasContent = document.summary || document.quiz || document.glossary

  // Only Quiz and Glossary as learning options (Summary removed)
  const learningOptions = [
    {
      title: 'Quiz',
      description: 'Test your knowledge with a quiz',
      icon: HelpCircle,
      href: `/learn/${id}/quiz`,
      available: !!document.quiz,
    },
    {
      title: 'Glossary',
      description: 'Learn key terms and definitions',
      icon: List,
      href: `/learn/${id}/glossary`,
      available: !!document.glossary,
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Link to="/documents">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Documents
        </Button>
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{document.title}</h1>
            <p className="text-muted-foreground">
              {formatFileSize(document.fileSize)} • Uploaded {formatDate(document.createdAt)}
            </p>
          </div>
        </div>
        <Link to={`/documents/${id}/view`}>
          <Button>
            <Eye className="w-4 h-4 mr-2" />
            Open in Viewer
          </Button>
        </Link>
      </div>

      {/* Compact Summary with Markdown */}
      {document.summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground max-h-48 overflow-y-auto">
              <MarkdownRenderer content={document.summary} className="text-sm" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Chat - Available before opening viewer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat about Document
          </CardTitle>
          <CardDescription>
            Ask questions about this document before opening the viewer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div 
            ref={chatMessagesRef}
            className="min-h-[150px] max-h-[300px] overflow-y-auto mb-4 space-y-3 border rounded-lg p-3 bg-muted/30"
          >
            {chatMessages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ask questions about this document</p>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <MarkdownRenderer content={message.content} className="text-sm" />
                    )}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about this document..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={isChatLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isChatLoading}
              size="icon"
            >
              {isChatLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Content Card */}
      {!hasContent && (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Generate Learning Content</CardTitle>
                <CardDescription>
                  Use AI to create quizzes, glossary terms, and more from this document
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGenerateContent} 
              disabled={isGenerating || !document.content}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
            {!document.content && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                No text content available. Upload a PDF with extractable text.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Learning Options - Only Quiz and Glossary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningOptions.map((option) => (
          <Card key={option.title} className={!option.available ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <option.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {option.available ? (
                <Link to={option.href}>
                  <Button className="w-full">Start Learning</Button>
                </Link>
              ) : (
                <Button className="w-full" disabled>
                  Generate Content First
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Stats */}
      {hasContent && (
        <Card>
          <CardHeader>
            <CardTitle>Content Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{(document.quiz as unknown[])?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Quiz Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{(document.glossary as unknown[])?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Glossary Terms</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{(document.concepts as unknown[])?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Concepts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
