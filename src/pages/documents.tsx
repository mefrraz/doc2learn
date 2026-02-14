import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Upload, Search, X } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { apiEndpoint } from '@/lib/config'
import type { Document } from '@/lib/types'

export function DocumentsPage() {
  const { user, token } = useAuthStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const fetchDocuments = useCallback(async () => {
    if (!user || !token) {
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
  }, [user, token])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !token) return

    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Only PDF files are supported',
      })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'File size must be less than 50MB',
      })
      return
    }

    setIsUploading(true)

    try {
      // Use FormData for file upload with PDF parsing
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name.replace('.pdf', ''))

      const response = await fetch(apiEndpoint('api/documents/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const data = await response.json()
      
      toast({
        title: 'Success',
        description: `Document uploaded successfully. Extracted ${data.metadata?.textLength || 0} characters from ${data.metadata?.numPages || 0} pages.`,
      })

      fetchDocuments()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload document',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return

    try {
      await fetch(apiEndpoint(`api/documents/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      
      toast({
        title: 'Success',
        description: 'Document deleted',
      })
      
      fetchDocuments()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete document',
      })
    }
  }

  const filteredDocuments = searchQuery
    ? documents.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your PDFs
          </p>
        </div>
        <div>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={isUploading}>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload PDF'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload your first PDF to start creating learning experiences
            </p>
            <label htmlFor="file-upload">
              <Button asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </span>
              </Button>
            </label>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="group">
              <CardContent className="p-4">
                <Link to={`/documents/${doc.id}`} className="block">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 mt-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.summary 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {doc.summary ? 'Ready' : 'Processing'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
