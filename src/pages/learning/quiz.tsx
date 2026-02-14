import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy, Star, Sparkles, Target, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiEndpoint } from '@/lib/config'

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

interface Document {
  id: string
  title: string
  quiz: QuizQuestion[]
}

// Motivational messages for correct answers
const CORRECT_MESSAGES = [
  { title: 'Excelente!', description: 'Acertaste em cheio!', emoji: '🎯' },
  { title: 'Perfeito!', description: 'Dominaste este conceito!', emoji: '⭐' },
  { title: 'Muito bem!', description: 'Continua assim!', emoji: '💪' },
  { title: 'Fantástico!', description: 'Estás a brilhar!', emoji: '✨' },
  { title: 'Incrível!', description: 'Que resposta genial!', emoji: '🧠' },
  { title: 'Brilhante!', description: 'O teu conhecimento é sólido!', emoji: '💎' },
  { title: 'Assim é que é!', description: 'Estás no caminho certo!', emoji: '🚀' },
  { title: 'Mandaste bem!', description: 'Excelente trabalho!', emoji: '🏆' },
]

// Motivational messages for incorrect answers
const INCORRECT_MESSAGES = [
  { title: 'Quase lá!', description: 'Tenta novamente!', emoji: '🔄' },
  { title: 'Não desistas!', description: 'A prática leva à perfeição!', emoji: '📚' },
  { title: 'Boa tentativa!', description: 'Revê o material e tenta novamente!', emoji: '🔍' },
  { title: 'Não te preocupes!', description: 'Cada erro é uma oportunidade de aprender!', emoji: '💡' },
  { title: 'Continua a tentar!', description: 'Estás quase a conseguir!', emoji: '🎯' },
  { title: 'Força!', description: 'O sucesso vem com persistência!', emoji: '💪' },
  { title: 'Ânimo!', description: 'Aprendizagem é um processo!', emoji: '🌱' },
  { title: 'Não baixos os braços!', description: 'Vais conseguir!', emoji: '🌟' },
]

// Final score messages
const getScoreMessage = (percentage: number) => {
  if (percentage === 100) {
    return { title: 'Perfeição Absoluta!', description: 'Conquistaste todos os pontos! És um mestre neste tema!', icon: Trophy }
  } else if (percentage >= 90) {
    return { title: 'Excelente!', description: 'Quase perfeito! O teu conhecimento é impressionante!', icon: Star }
  } else if (percentage >= 70) {
    return { title: 'Muito Bem!', description: 'Bom trabalho! Continua a praticar para melhorar ainda mais!', icon: Target }
  } else if (percentage >= 50) {
    return { title: 'Bom Esforço!', description: 'Estás no caminho certo! Revê os pontos que falhaste.', icon: Sparkles }
  } else {
    return { title: 'Continua a Tentar!', description: 'Não desistas! Cada tentativa é uma oportunidade de aprender.', icon: Zap }
  }
}

export function QuizPage() {
  const { experienceId } = useParams<{ experienceId: string }>()
  const documentId = experienceId // Alias for clarity
  const { token } = useAuthStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [lastMessage, setLastMessage] = useState<{ title: string; description: string; emoji: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
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
          setAnswers(new Array((data.document.quiz as QuizQuestion[])?.length || 0).fill(null))
        }
      } catch (error) {
        console.error('Error fetching document:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [documentId, token])

  const questions = (document?.quiz as QuizQuestion[]) || []

  const getRandomMessage = useCallback((correct: boolean) => {
    const messages = correct ? CORRECT_MESSAGES : INCORRECT_MESSAGES
    return messages[Math.floor(Math.random() * messages.length)]
  }, [])

  const handleSelectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedAnswer
    setAnswers(newAnswers)
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correct
    const message = getRandomMessage(isCorrect)
    setLastMessage(message)
    
    if (isCorrect) {
      setStreak(prev => prev + 1)
      setCorrectCount(prev => prev + 1)
      
      // Show streak bonus
      if (streak >= 2) {
        toast({
          title: `🔥 Sequência de ${streak + 1}!`,
          description: 'Estás imparável!',
        })
      }
    } else {
      setStreak(0)
    }
    
    setShowResult(true)
    
    // Show toast with motivational message
    toast({
      title: message.title,
      description: message.description,
      variant: isCorrect ? 'default' : 'destructive',
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      setIsComplete(true)
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setLastMessage(null)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setAnswers(new Array(questions.length).fill(null))
    setIsComplete(false)
    setLastMessage(null)
    setStreak(0)
    setCorrectCount(0)
  }

  const calculateScore = () => {
    return correctCount
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border-strong border-t-action"></div>
      </div>
    )
  }

  if (!document || questions.length === 0) {
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
            <Target className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">No Quiz Available</h2>
            <p className="text-text-secondary mb-6">Generate learning content first to access the quiz</p>
            <Link to={`/documents/${documentId}`}>
              <Button className="bg-action hover:bg-action-hover text-white">Go to Document</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isComplete) {
    const score = calculateScore()
    const percentage = Math.round((score / questions.length) * 100)
    const scoreMessage = getScoreMessage(percentage)
    const ScoreIcon = scoreMessage.icon

    return (
      <div className="min-h-screen bg-surface">
        {/* Header */}
        <div className="border-b border-border bg-surface-elevated">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <Link to={`/documents/${documentId}`}>
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Results Card */}
          <div className="bg-surface-elevated border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="text-center py-8 border-b border-border">
              <ScoreIcon className="w-16 h-16 mx-auto text-action mb-4" />
              <h2 className="text-2xl font-semibold text-text-primary mb-2">{scoreMessage.title}</h2>
              <p className="text-text-secondary">{scoreMessage.description}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Score display */}
              <div className="text-center">
                <div className="text-5xl font-bold text-action mb-2">{percentage}%</div>
                <p className="text-text-secondary">
                  {score} correct out of {questions.length} questions
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-border rounded bg-surface">
                  <p className="text-2xl font-bold text-success">{score}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Correct</p>
                </div>
                <div className="p-4 border border-border rounded bg-surface">
                  <p className="text-2xl font-bold text-error">{questions.length - score}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Incorrect</p>
                </div>
                <div className="p-4 border border-border rounded bg-surface">
                  <p className="text-2xl font-bold text-action">{streak}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Best Streak</p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={handleRestart} className="bg-action hover:bg-action-hover text-white">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link to={`/documents/${documentId}`}>
                  <Button variant="outline" className="border-border text-text-secondary hover:text-text-primary">
                    Back to Document
                  </Button>
                </Link>
              </div>

              {/* Answer review */}
              <div className="space-y-3 pt-6 border-t border-border">
                <h3 className="font-medium text-text-primary">Review Your Answers</h3>
                {questions.map((q, i) => (
                  <div 
                    key={i}
                    className={`p-4 border rounded ${
                      answers[i] === q.correct 
                        ? 'border-success bg-success-light' 
                        : 'border-error bg-error-light'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {answers[i] === q.correct ? (
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-text-primary mb-2">{q.question}</p>
                        <p className="text-sm text-text-secondary">
                          Your answer: <span className={answers[i] === q.correct ? 'text-success' : 'text-error'}>
                            {q.options[answers[i] as number]}
                          </span>
                        </p>
                        {answers[i] !== q.correct && (
                          <p className="text-sm text-text-secondary mt-1">
                            Correct answer: <span className="text-success">{q.options[q.correct]}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const isCorrect = showResult && selectedAnswer === question.correct

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-border bg-surface-elevated">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/documents/${documentId}`}>
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              {streak >= 2 && (
                <span className="text-warning font-medium flex items-center gap-1">
                  🔥 {streak} streak!
                </span>
              )}
              <span className="text-sm text-text-muted font-mono">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-action transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>{correctCount} correct</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Feedback message */}
        {showResult && lastMessage && (
          <div className={`p-4 rounded border text-center ${
            isCorrect 
              ? 'bg-success-light border-success' 
              : 'bg-error-light border-error'
          }`}>
            <span className="text-xl mr-2">{lastMessage.emoji}</span>
            <span className={`font-medium ${isCorrect ? 'text-success' : 'text-error'}`}>
              {lastMessage.title}
            </span>
            <p className="text-sm text-text-secondary mt-1">{lastMessage.description}</p>
          </div>
        )}

        {/* Question */}
        <div className={`bg-surface-elevated border rounded-lg p-6 ${showResult ? (isCorrect ? 'border-success' : 'border-error') : 'border-border'}`}>
          <h2 className="text-lg font-medium text-text-primary mb-6">{question.question}</h2>
          
          <div className="space-y-2">
            {question.options.map((option, index) => {
              let containerClass = 'border border-border rounded cursor-pointer transition-all'
              
              if (showResult) {
                if (index === question.correct) {
                  containerClass += ' bg-success-light border-success'
                } else if (index === selectedAnswer && index !== question.correct) {
                  containerClass += ' bg-error-light border-error'
                } else {
                  containerClass += ' opacity-50'
                }
              } else if (selectedAnswer === index) {
                containerClass += ' bg-action-light border-action'
              } else {
                containerClass += ' hover:border-border-strong'
              }

              return (
                <div
                  key={index}
                  className={containerClass}
                  onClick={() => handleSelectAnswer(index)}
                >
                  <div className="flex items-center gap-3 p-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      showResult && index === question.correct
                        ? 'bg-success border-success text-white'
                        : showResult && index === selectedAnswer && index !== question.correct
                        ? 'bg-error border-error text-white'
                        : selectedAnswer === index
                        ? 'bg-action border-action text-white'
                        : 'border-border text-text-secondary'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-text-primary">{option}</span>
                    {showResult && index === question.correct && (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                    {showResult && index === selectedAnswer && index !== question.correct && (
                      <XCircle className="w-5 h-5 text-error" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!showResult ? (
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={selectedAnswer === null}
              className="bg-action hover:bg-action-hover text-white"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className="bg-action hover:bg-action-hover text-white"
            >
              {currentQuestion + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
