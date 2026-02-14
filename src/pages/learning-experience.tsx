import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  FileText, 
  Lightbulb,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { apiEndpoint } from '@/lib/config'

interface Document {
  id: string
  title: string
  content: string
  summary?: string
  quiz?: any[]
  glossary?: any[]
  flashcards?: any[]
  concepts?: any[]
}

type TabType = 'summary' | 'quiz' | 'glossary' | 'flashcards'

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'quiz', label: 'Quiz', icon: Target },
  { id: 'glossary', label: 'Glossary', icon: BookOpen },
  { id: 'flashcards', label: 'Flashcards', icon: Lightbulb },
]

export function LearningExperiencePage() {
  const { experienceId } = useParams<{ experienceId: string }>()
  const documentId = experienceId
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId || !token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(apiEndpoint(`api/documents/${documentId}`), {
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

    fetchDocument()
  }, [documentId, token])

  const handleGenerateContent = async () => {
    if (!document || isGenerating) return

    setIsGenerating(true)
    try {
      const response = await fetch(apiEndpoint(`api/documents/${documentId}/generate`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setDocument(prev => prev ? { ...prev, ...data } : prev)
        toast({
          title: 'Content generated!',
          description: 'Your learning content is ready.',
        })
      } else {
        throw new Error('Failed to generate content')
      }
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

  const hasContent = (type: TabType) => {
    if (!document) return false
    switch (type) {
      case 'summary': return !!document.summary
      case 'quiz': return document.quiz && document.quiz.length > 0
      case 'glossary': return document.glossary && document.glossary.length > 0
      case 'flashcards': return document.flashcards && document.flashcards.length > 0
    }
    return false
  }

  const hasAnyContent = () => {
    return tabs.some(tab => hasContent(tab.id))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="space-y-6">
        <Link to="/documents">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Button>
        </Link>
        <div className="text-center py-12 bg-bg-secondary border border-border rounded-xl">
          <AlertCircle className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Document not found</h2>
          <p className="text-text-secondary">The document you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/documents/${documentId}`}>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{document.title}</h1>
            <p className="text-sm text-text-secondary">Learning Experience</p>
          </div>
        </div>
      </div>

      {/* Generate Content Banner */}
      {!hasAnyContent() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent-light border border-accent/20 rounded-xl p-6 text-center"
        >
          <BookOpen className="w-12 h-12 mx-auto text-accent mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No learning content yet</h3>
          <p className="text-text-secondary mb-4">
            Generate AI-powered learning content from this document
          </p>
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="bg-accent hover:bg-accent-hover text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Learning Content
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const hasTabContent = hasContent(tab.id)
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {hasTabContent && (
                  <span className="w-2 h-2 rounded-full bg-success" />
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="bg-bg-secondary border border-border rounded-xl p-6">
            {document.summary ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {document.summary}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-text-muted mb-4" />
                <p className="text-text-secondary">No summary available</p>
                <Button
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                  variant="outline"
                  className="mt-4"
                >
                  Generate Content
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            {document.quiz && document.quiz.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-text-secondary">{document.quiz.length} questions</p>
                  <Button
                    onClick={() => navigate(`/learn/${documentId}/quiz`)}
                    className="bg-accent hover:bg-accent-hover text-white"
                  >
                    Start Quiz
                  </Button>
                </div>
                <div className="bg-bg-secondary border border-border rounded-xl p-6">
                  {document.quiz.slice(0, 3).map((q: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <p className="font-medium text-text-primary">{index + 1}. {q.question}</p>
                      <p className="text-sm text-text-muted mt-1">
                        {q.options?.length || 0} options
                      </p>
                    </div>
                  ))}
                  {document.quiz.length > 3 && (
                    <p className="text-sm text-text-muted text-center">
                      +{document.quiz.length - 3} more questions
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 bg-bg-secondary border border-border rounded-xl">
                <Target className="w-12 h-12 mx-auto text-text-muted mb-4" />
                <p className="text-text-secondary">No quiz available</p>
              </div>
            )}
          </div>
        )}

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <div className="space-y-4">
            {document.glossary && document.glossary.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-text-secondary">{document.glossary.length} terms</p>
                  <Button
                    onClick={() => navigate(`/learn/${documentId}/glossary`)}
                    variant="outline"
                  >
                    View Full Glossary
                  </Button>
                </div>
                <div className="grid gap-3">
                  {document.glossary.slice(0, 6).map((term: any, index: number) => (
                    <div
                      key={index}
                      className="bg-bg-secondary border border-border rounded-lg p-4"
                    >
                      <p className="font-medium text-text-primary">{term.term}</p>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {term.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 bg-bg-secondary border border-border rounded-xl">
                <BookOpen className="w-12 h-12 mx-auto text-text-muted mb-4" />
                <p className="text-text-secondary">No glossary available</p>
              </div>
            )}
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            {document.flashcards && document.flashcards.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-text-secondary">{document.flashcards.length} flashcards</p>
                  <Button
                    onClick={() => navigate(`/learn/${documentId}/flashcards`)}
                    variant="outline"
                  >
                    Study Flashcards
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {document.flashcards.slice(0, 6).map((card: any, index: number) => (
                    <div
                      key={index}
                      className="bg-bg-secondary border border-border rounded-lg p-4"
                    >
                      <p className="font-medium text-text-primary mb-2">{card.front}</p>
                      <p className="text-sm text-text-secondary border-t border-border pt-2">
                        {card.back}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 bg-bg-secondary border border-border rounded-xl">
                <Lightbulb className="w-12 h-12 mx-auto text-text-muted mb-4" />
                <p className="text-text-secondary">No flashcards available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
