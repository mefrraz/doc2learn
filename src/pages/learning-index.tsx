import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  FileText, 
  Target, 
  Lightbulb,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiEndpoint } from '@/lib/config'

interface Document {
  id: string
  title: string
  createdAt: string
  summary?: string
  quiz?: any[]
  glossary?: any[]
  flashcards?: any[]
}

export function LearningIndexPage() {
  const { token } = useAuthStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(apiEndpoint('api/documents'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setDocuments(data.documents || [])
        }
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [token])

  const hasLearningContent = (doc: Document) => {
    return doc.summary || 
           (doc.quiz && doc.quiz.length > 0) || 
           (doc.glossary && doc.glossary.length > 0) || 
           (doc.flashcards && doc.flashcards.length > 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
          <BookOpen className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Learning Center</h1>
        <p className="text-text-secondary">
          Transform your documents into interactive learning experiences with AI-powered quizzes, 
          flashcards, glossaries, and summaries.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-medium text-text-primary">Summaries</h3>
          </div>
          <p className="text-sm text-text-secondary">
            AI-generated summaries highlighting key concepts and main ideas.
          </p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="font-medium text-text-primary">Quizzes</h3>
          </div>
          <p className="text-sm text-text-secondary">
            Test your knowledge with automatically generated quiz questions.
          </p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-medium text-text-primary">Glossary</h3>
          </div>
          <p className="text-sm text-text-secondary">
            Learn key terms and definitions from your documents.
          </p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="font-medium text-text-primary">Flashcards</h3>
          </div>
          <p className="text-sm text-text-secondary">
            Memorize important concepts with interactive flashcards.
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Your Documents</h2>
        
        {documents.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary border border-border rounded-xl">
            <FileText className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No documents yet</h3>
            <p className="text-text-secondary mb-4">
              Upload a document to start learning
            </p>
            <Link to="/documents">
              <Button className="bg-accent hover:bg-accent-hover text-white">
                Upload Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/learn/${doc.id}`}
                className="block bg-bg-secondary border border-border rounded-xl p-5 hover:border-accent/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-bg-tertiary flex items-center justify-center">
                      <FileText className="w-6 h-6 text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary group-hover:text-accent transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-text-muted">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {hasLearningContent(doc) && (
                      <div className="flex items-center gap-2">
                        {doc.summary && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-500">
                            Summary
                          </span>
                        )}
                        {doc.quiz && doc.quiz.length > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500">
                            Quiz
                          </span>
                        )}
                        {doc.glossary && doc.glossary.length > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-500">
                            Glossary
                          </span>
                        )}
                        {doc.flashcards && doc.flashcards.length > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-500/10 text-orange-500">
                            Flashcards
                          </span>
                        )}
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
