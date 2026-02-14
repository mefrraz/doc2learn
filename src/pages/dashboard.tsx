import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Brain, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Document } from '@/lib/types'

const API_URL = 'http://localhost:3001'

export function DashboardPage() {
  const { user, token } = useAuthStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/documents`, {
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

    fetchData()
  }, [user, token])

  const stats = [
    {
      title: 'Total Documents',
      value: documents.length,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'This Week',
      value: documents.filter(d => 
        new Date(d.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your learning materials.
          </p>
        </div>
        <Link to="/documents">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`p-3 rounded-lg bg-background ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your latest uploaded files</CardDescription>
          </div>
          <Link to="/documents">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents yet</p>
              <Link to="/documents">
                <Button variant="outline" className="mt-4">
                  Upload your first document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.slice(0, 5).map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.summary 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {doc.summary ? 'Ready' : 'Processing'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Experiences Placeholder */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Learning Experiences</CardTitle>
            <CardDescription>Your generated learning content</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Coming soon!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a document and configure your API key to generate learning content.
            </p>
            <Link to="/settings/api-keys">
              <Button variant="outline" className="mt-4">
                Configure API Key
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
