import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  Sparkles, 
  Send, 
  Loader2, 
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/stores/authStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIPanelProps {
  documentId: string
  selectedText?: string
  pageContent?: string
  onClose?: () => void
}

const API_URL = 'http://localhost:3001'

type TabType = 'chat' | 'summarize' | 'quiz' | 'exercises'

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'summarize', label: 'Summarize', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: Target },
  { id: 'exercises', label: 'Exercises', icon: Lightbulb },
]

export function AIPanel({ documentId, selectedText, pageContent, onClose }: AIPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [quiz, setQuiz] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { token } = useAuthStore()
  const { toast } = useToast()

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle selected text
  useEffect(() => {
    if (selectedText) {
      setInput(`Explain this: "${selectedText}"`)
    }
  }, [selectedText])

  // Chat
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/ai/documents/${documentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          pageContent,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
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
      setIsLoading(false)
    }
  }

  // Summarize
  const handleSummarize = async () => {
    if (!pageContent || isLoading) return
    
    setIsLoading(true)
    setSummary('')

    try {
      const response = await fetch(`${API_URL}/api/ai/documents/${documentId}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: pageContent }),
      })

      const data = await response.json()

      if (response.ok) {
        setSummary(data.summary)
      } else {
        throw new Error(data.error || 'Failed to generate summary')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate summary',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    if (!pageContent || isLoading) return
    
    setIsLoading(true)
    setQuiz([])

    try {
      const response = await fetch(`${API_URL}/api/ai/documents/${documentId}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: pageContent }),
      })

      const data = await response.json()

      if (response.ok) {
        setQuiz(data.quiz || [])
      } else {
        throw new Error(data.error || 'Failed to generate quiz')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate quiz',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate Exercises
  const handleGenerateExercises = async () => {
    if (!pageContent || isLoading) return
    
    setIsLoading(true)
    setExercises([])

    try {
      const response = await fetch(`${API_URL}/api/ai/documents/${documentId}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: pageContent }),
      })

      const data = await response.json()

      if (response.ok) {
        setExercises(data.exercises || [])
      } else {
        throw new Error(data.error || 'Failed to generate exercises')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate exercises',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    
    // Auto-generate for non-chat tabs
    if (tab === 'summarize' && !summary && pageContent) {
      handleSummarize()
    } else if (tab === 'quiz' && quiz.length === 0 && pageContent) {
      handleGenerateQuiz()
    } else if (tab === 'exercises' && exercises.length === 0 && pageContent) {
      handleGenerateExercises()
    }
  }

  return (
    <motion.div
      initial={{ width: 320 }}
      animate={{ width: isCollapsed ? 48 : 320 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-full bg-bg-secondary border-l border-border flex flex-col"
    >
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-medium text-text-primary text-sm">AI Assistant</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-accent border-b-2 border-accent'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-auto p-3 space-y-3 scrollbar-thin">
                    {messages.length === 0 && (
                      <div className="text-center text-text-muted py-8">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Start a conversation</p>
                        {selectedText && (
                          <p className="text-xs mt-2 text-accent">
                            Selected text ready to discuss
                          </p>
                        )}
                      </div>
                    )}
                    
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            msg.role === 'user'
                              ? 'bg-accent text-white'
                              : 'bg-bg-tertiary text-text-primary'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-bg-tertiary rounded-lg px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-border">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask a question..."
                        className="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        className="w-9 h-9 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Summarize Tab */}
              {activeTab === 'summarize' && (
                <div className="h-full overflow-auto p-3 scrollbar-thin">
                  {isLoading && !summary && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                  )}
                  
                  {summary && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {summary}
                      </p>
                    </div>
                  )}
                  
                  {!isLoading && !summary && !pageContent && (
                    <div className="text-center text-text-muted py-8">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No content to summarize</p>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Tab */}
              {activeTab === 'quiz' && (
                <div className="h-full overflow-auto p-3 space-y-3 scrollbar-thin">
                  {isLoading && quiz.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                  )}
                  
                  {quiz.map((q, index) => (
                    <div key={index} className="p-3 bg-bg-tertiary rounded-lg">
                      <p className="text-sm font-medium text-text-primary mb-2">
                        {index + 1}. {q.question}
                      </p>
                      <div className="space-y-1">
                        {q.options?.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className="text-xs text-text-secondary pl-4"
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {!isLoading && quiz.length === 0 && !pageContent && (
                    <div className="text-center text-text-muted py-8">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No content for quiz</p>
                    </div>
                  )}
                </div>
              )}

              {/* Exercises Tab */}
              {activeTab === 'exercises' && (
                <div className="h-full overflow-auto p-3 space-y-3 scrollbar-thin">
                  {isLoading && exercises.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                  )}
                  
                  {exercises.map((ex, index) => (
                    <div key={index} className="p-3 bg-bg-tertiary rounded-lg">
                      <p className="text-sm font-medium text-text-primary mb-1">
                        {index + 1}. {ex.question}
                      </p>
                      <p className="text-xs text-text-muted">
                        Type: {ex.type}
                      </p>
                    </div>
                  ))}
                  
                  {!isLoading && exercises.length === 0 && !pageContent && (
                    <div className="text-center text-text-muted py-8">
                      <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No content for exercises</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
