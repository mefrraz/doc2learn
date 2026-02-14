import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, BookOpen, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiEndpoint } from '@/lib/config'

interface GlossaryTerm {
  term: string
  definition: string
}

interface Document {
  id: string
  title: string
  glossary: GlossaryTerm[]
}

export function GlossaryPage() {
  const { experienceId } = useParams<{ experienceId: string }>()
  const documentId = experienceId // Alias for clarity
  const { token } = useAuthStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())
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

  const glossary = (document?.glossary as GlossaryTerm[]) || []

  // Get unique first letters
  const availableLetters = useMemo(() => {
    const letters = new Set<string>()
    glossary.forEach(term => {
      const firstLetter = term.term.charAt(0).toUpperCase()
      if (/[A-Z]/.test(firstLetter)) {
        letters.add(firstLetter)
      }
    })
    return Array.from(letters).sort()
  }, [glossary])

  // Filter glossary
  const filteredGlossary = useMemo(() => {
    let filtered = glossary

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        term => 
          term.term.toLowerCase().includes(query) || 
          term.definition.toLowerCase().includes(query)
      )
    }

    if (selectedLetter) {
      filtered = filtered.filter(
        term => term.term.charAt(0).toUpperCase() === selectedLetter
      )
    }

    return filtered.sort((a, b) => a.term.localeCompare(b.term))
  }, [glossary, searchQuery, selectedLetter])

  // Group by letter for display
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {}
    filteredGlossary.forEach(term => {
      const letter = term.term.charAt(0).toUpperCase()
      if (!groups[letter]) {
        groups[letter] = []
      }
      groups[letter].push(term)
    })
    return groups
  }, [filteredGlossary])

  const toggleTerm = (term: string) => {
    setExpandedTerms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(term)) {
        newSet.delete(term)
      } else {
        newSet.add(term)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border-strong border-t-action"></div>
      </div>
    )
  }

  if (!document || glossary.length === 0) {
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
            <h2 className="text-xl font-semibold text-text-primary mb-2">No Glossary</h2>
            <p className="text-text-secondary mb-6">Generate learning content first to access the glossary</p>
            <Link to={`/documents/${documentId}`}>
              <Button className="bg-action hover:bg-action-hover text-white">Go to Document</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-border bg-surface-elevated">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/documents/${documentId}`}>
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <span className="text-sm text-text-muted font-mono">
              {glossary.length} terms
            </span>
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Glossary</h1>
          <p className="text-text-secondary">{document.title}</p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 border-border bg-surface-elevated"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Letter filters */}
        <div className="flex flex-wrap justify-center gap-1 mb-8">
          <Button
            variant={selectedLetter === null ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedLetter(null)}
            className={`min-w-[36px] h-8 ${selectedLetter === null ? 'bg-action text-white hover:bg-action-hover' : 'text-text-secondary hover:text-text-primary'}`}
          >
            All
          </Button>
          {availableLetters.map(letter => (
            <Button
              key={letter}
              variant={selectedLetter === letter ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
              className={`min-w-[36px] h-8 ${selectedLetter === letter ? 'bg-action text-white hover:bg-action-hover' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {letter}
            </Button>
          ))}
        </div>

        {/* Results count */}
        {(searchQuery || selectedLetter) && (
          <p className="text-center text-sm text-text-muted mb-6">
            Found {filteredGlossary.length} term{filteredGlossary.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Glossary List */}
        <div className="space-y-6">
          {Object.entries(groupedTerms).map(([letter, terms]) => (
            <div key={letter}>
              {/* Letter Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider w-8">{letter}</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-muted">{terms.length}</span>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                {terms.map((term, index) => {
                  const isExpanded = expandedTerms.has(term.term)
                  
                  return (
                    <div
                      key={`${term.term}-${index}`}
                      className="bg-surface-elevated border border-border rounded cursor-pointer transition-colors hover:border-border-strong"
                      onClick={() => toggleTerm(term.term)}
                    >
                      <div className="px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-text-primary">
                              {term.term}
                            </h3>
                            <p className={`text-sm text-text-secondary mt-1 ${
                              isExpanded ? '' : 'line-clamp-2'
                            }`}>
                              {term.definition}
                            </p>
                          </div>
                          <div className="flex-shrink-0 pt-1">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-text-muted" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-text-muted" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredGlossary.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <p className="text-text-secondary mb-4">No terms found matching your search</p>
            <Button
              variant="ghost"
              className="text-text-secondary hover:text-text-primary"
              onClick={() => {
                setSearchQuery('')
                setSelectedLetter(null)
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex gap-3 justify-center pt-8 mt-8 border-t border-border">
          <Link to={`/learn/${documentId}/quiz`}>
            <Button variant="outline" className="border-border text-text-secondary hover:text-text-primary">
              Take Quiz
            </Button>
          </Link>
          <Link to={`/learn/${documentId}/summary`}>
            <Button variant="outline" className="border-border text-text-secondary hover:text-text-primary">
              View Summary
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
