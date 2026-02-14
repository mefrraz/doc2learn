import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiEndpoint } from '@/lib/config'

interface Document {
  id: string
  title: string
  flashcards?: Array<{ front: string; back: string }>
}

export function FlashcardsPage() {
  const { experienceId } = useParams<{ experienceId: string }>()
  const { token } = useAuthStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    const fetchDocument = async () => {
      if (!experienceId || !token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(apiEndpoint(`api/documents/${experienceId}`), {
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
  }, [experienceId, token])

  const flashcards = document?.flashcards || []

  const goToNext = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length)
    }, 150)
  }

  const goToPrev = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    }, 150)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!document || flashcards.length === 0) {
    return (
      <div className="space-y-6">
        <Link to={`/learn/${experienceId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning
          </Button>
        </Link>
        <div className="text-center py-12 bg-bg-secondary border border-border rounded-xl">
          <p className="text-text-secondary">No flashcards available for this document.</p>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to={`/learn/${experienceId}`}>
          <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="text-sm text-text-muted">
          {currentIndex + 1} / {flashcards.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="flex justify-center py-8">
        <div 
          className="w-full max-w-lg h-72 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-full h-full rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg ${
                isFlipped 
                  ? 'bg-accent text-white' 
                  : 'bg-bg-secondary border border-border text-text-primary'
              }`}
            >
              <p className="text-sm uppercase tracking-wider mb-4 opacity-60">
                {isFlipped ? 'Answer' : 'Question'}
              </p>
              <p className="text-xl font-medium leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={goToPrev}
          disabled={flashcards.length <= 1}
          className="w-24"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Prev
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsFlipped(false)}
          className="w-24"
        >
          <RotateCcw className="w-5 h-5 mr-1" />
          Flip
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={goToNext}
          disabled={flashcards.length <= 1}
          className="w-24"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>

      {/* Tip */}
      <p className="text-center text-sm text-text-muted">
        Click on the card to flip it
      </p>
    </div>
  )
}
