import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Plus, 
  BookOpen, 
  Target, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  Upload
} from 'lucide-react'
import { motion } from 'framer-motion'
import { apiEndpoint } from '@/lib/config'

interface Document {
  id: string
  title: string
  filename: string
  createdAt: string
  glossary?: any[]
  quiz?: any[]
  summary?: string
}

interface Stats {
  totalDocuments: number
  totalWords: number
  quizzesCompleted: number
  streak: number
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { user, token } = useAuthStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    totalWords: 0,
    quizzesCompleted: 0,
    streak: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
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
          
          // Calculate stats
          const totalDocs = data.documents?.length || 0
          const totalWords = data.documents?.reduce((acc: number, doc: Document) => {
            return acc + (doc.summary?.split(/\s+/).length || 0)
          }, 0) || 0
          
          setStats({
            totalDocuments: totalDocs,
            totalWords,
            quizzesCompleted: 0, // TODO: Track this
            streak: 0, // TODO: Track this
          })
        }
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const recentDocuments = documents.slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {t('dashboard.welcome', { name: user?.email?.split('@')[0] || 'User' })}
          </h1>
          <p className="text-text-secondary mt-1">
            {t('dashboard.continueLearning')}
          </p>
        </div>
        
        <Link to="/documents">
          <Button className="bg-accent hover:bg-accent-hover text-white gap-2">
            <Plus className="w-4 h-4" />
            {t('navigation.newDocument')}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-secondary border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">{stats.totalDocuments}</p>
              <p className="text-sm text-text-muted">{t('dashboard.totalDocuments')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-secondary border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">{stats.totalWords.toLocaleString()}</p>
              <p className="text-sm text-text-muted">{t('dashboard.wordsLearned')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-secondary border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <Target className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">{stats.quizzesCompleted}</p>
              <p className="text-sm text-text-muted">{t('dashboard.quizzesCompleted')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-secondary border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-error-light flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">{stats.streak}</p>
              <p className="text-sm text-text-muted">{t('dashboard.dayStreak')}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-accent to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">{t('navigation.aiAssistant')}</h3>
              <p className="text-white/80 text-sm mb-4">
                {t('dashboard.aiAssistantDesc', 'Ask questions about your documents, get summaries, and generate quizzes')}
              </p>
              <Link to="/chat">
                <Button variant="secondary" size="sm" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t('dashboard.startChat', 'Start Chat')}
                </Button>
              </Link>
            </div>
            <Sparkles className="w-12 h-12 text-white/20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-bg-secondary border border-border rounded-xl p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-text-primary mb-2">{t('dashboard.uploadDocument')}</h3>
              <p className="text-text-secondary text-sm mb-4">
                {t('dashboard.uploadDesc', 'Upload a PDF document and start learning with AI-powered tools')}
              </p>
              <Link to="/documents">
                <Button variant="outline" size="sm" className="gap-2 border-border text-text-secondary hover:text-text-primary">
                  <Upload className="w-4 h-4" />
                  {t('documents.upload')}
                </Button>
              </Link>
            </div>
            <Upload className="w-12 h-12 text-text-muted" />
          </div>
        </motion.div>
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{t('dashboard.recentDocuments')}</h2>
          <Link 
            to="/documents"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            {t('dashboard.viewAllDocuments')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border-strong border-t-accent"></div>
          </div>
        ) : recentDocuments.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary border border-border rounded-xl">
            <FileText className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h3 className="font-medium text-text-primary mb-2">{t('dashboard.noDocumentsYet')}</h3>
            <p className="text-text-secondary text-sm mb-4">
              {t('dashboard.uploadFirst')}
            </p>
            <Link to="/documents">
              <Button className="bg-accent hover:bg-accent-hover text-white">
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.uploadFirstButton')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={`/documents/${doc.id}`}
                  className="block bg-bg-secondary border border-border rounded-xl p-4 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">
                        {doc.title || doc.filename}
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress indicators */}
                  <div className="flex gap-2 mt-3">
                    {doc.summary && (
                      <span className="text-xs bg-success-light text-success px-2 py-0.5 rounded">
                        Summary
                      </span>
                    )}
                    {doc.quiz && doc.quiz.length > 0 && (
                      <span className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded">
                        Quiz
                      </span>
                    )}
                    {doc.glossary && doc.glossary.length > 0 && (
                      <span className="text-xs bg-warning-light text-warning px-2 py-0.5 rounded">
                        Glossary
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Learning Tips */}
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Learning Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-accent">1</span>
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">Active Recall</p>
              <p className="text-xs text-text-secondary">Take quizzes to reinforce your memory</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-accent">2</span>
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">Spaced Repetition</p>
              <p className="text-xs text-text-secondary">Review glossary terms regularly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-accent">3</span>
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">Ask Questions</p>
              <p className="text-xs text-text-secondary">Use AI chat to clarify concepts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
