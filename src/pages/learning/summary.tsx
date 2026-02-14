import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Copy, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiEndpoint } from '@/lib/config'

interface Document {
  id: string
  title: string
  summary: string
}

// Simple markdown renderer
function renderMarkdown(text: string): JSX.Element[] {
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let listItems: string[] = []
  let inList = false

  lines.forEach((line, index) => {
    // Handle list items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true
      listItems.push(line.slice(2))
      return
    }

    // Flush list if we were in one
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${index}`} className="list-disc list-inside space-y-1 my-3 ml-4">
          {listItems.map((item, i) => (
            <li key={i} className="text-text-secondary">{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      listItems = []
      inList = false
    }

    // Handle headings
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-text-primary">
          {renderInlineMarkdown(line.slice(3))}
        </h2>
      )
      return
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-text-primary">
          {renderInlineMarkdown(line.slice(4))}
        </h3>
      )
      return
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-2xl font-semibold mt-6 mb-4 text-text-primary">
          {renderInlineMarkdown(line.slice(2))}
        </h1>
      )
      return
    }

    // Handle blockquotes
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={index} className="border-l-2 border-action pl-4 italic my-3 text-text-secondary">
          {renderInlineMarkdown(line.slice(2))}
        </blockquote>
      )
      return
    }

    // Handle empty lines
    if (line.trim() === '') {
      return
    }

    // Regular paragraph
    elements.push(
      <p key={index} className="my-3 text-text-secondary leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>
    )
  })

  // Flush remaining list
  if (listItems.length > 0) {
    elements.push(
      <ul key="list-final" className="list-disc list-inside space-y-1 my-3 ml-4">
        {listItems.map((item, i) => (
          <li key={i} className="text-text-secondary">{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    )
  }

  return elements
}

// Render inline markdown (bold, italic, code)
function renderInlineMarkdown(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    if (boldMatch) {
      const before = remaining.slice(0, boldMatch.index!)
      if (before) parts.push(before)
      parts.push(
        <strong key={key++} className="font-medium text-text-primary">
          {boldMatch[1]}
        </strong>
      )
      remaining = remaining.slice(boldMatch.index! + boldMatch[0].length)
      continue
    }

    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/)
    if (italicMatch) {
      const before = remaining.slice(0, italicMatch.index!)
      if (before) parts.push(before)
      parts.push(
        <em key={key++} className="italic">
          {italicMatch[1]}
        </em>
      )
      remaining = remaining.slice(italicMatch.index! + italicMatch[0].length)
      continue
    }

    // Code
    const codeMatch = remaining.match(/`(.+?)`/)
    if (codeMatch) {
      const before = remaining.slice(0, codeMatch.index!)
      if (before) parts.push(before)
      parts.push(
        <code key={key++} className="bg-surface border border-border px-1.5 py-0.5 rounded text-sm font-mono text-text-primary">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch.index! + codeMatch[0].length)
      continue
    }

    // No more matches
    parts.push(remaining)
    break
  }

  return parts
}

export function SummaryPage() {
  const { experienceId } = useParams<{ experienceId: string }>()
  const documentId = experienceId // Alias for clarity
  const { token } = useAuthStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
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

  const handleCopy = async () => {
    if (!document?.summary) return

    try {
      await navigator.clipboard.writeText(document.summary)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Summary copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy to clipboard',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border-strong border-t-action"></div>
      </div>
    )
  }

  if (!document || !document.summary) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="max-w-2xl mx-auto">
          <Link to={`/documents/${documentId}`}>
            <Button variant="ghost" size="sm" className="mb-6 text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Document
            </Button>
          </Link>
          <div className="text-center py-16 bg-surface-elevated border border-border rounded-lg">
            <BookOpen className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">No Summary</h2>
            <p className="text-text-secondary mb-6">Generate learning content first to access the summary</p>
            <Link to={`/documents/${documentId}`}>
              <Button className="bg-action hover:bg-action-hover text-white">Go to Document</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate reading time (average 200 words per minute)
  const wordCount = document.summary.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-border bg-surface-elevated">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/documents/${documentId}`}>
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="text-text-secondary hover:text-text-primary"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Summary</h1>
          <p className="text-text-secondary">{document.title}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm text-text-muted mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-2">
            <span>~{readingTime} min read</span>
          </div>
        </div>

        {/* Summary content */}
        <div className="bg-surface-elevated border border-border rounded-lg p-6">
          <div className="max-w-none">
            {renderMarkdown(document.summary)}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 justify-center pt-8 mt-8 border-t border-border">
          <Link to={`/learn/${documentId}/quiz`}>
            <Button variant="outline" className="border-border text-text-secondary hover:text-text-primary">
              Take Quiz
            </Button>
          </Link>
          <Link to={`/learn/${documentId}/glossary`}>
            <Button variant="outline" className="border-border text-text-secondary hover:text-text-primary">
              View Glossary
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
