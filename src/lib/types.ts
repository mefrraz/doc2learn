// Tipos para a aplicação

export interface User {
  id: string
  email: string
  name?: string | null
  createdAt?: string
}

export interface ApiKey {
  id: string
  provider: string
  keyLast4: string
  name: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface Document {
  id: string
  userId: string
  title: string
  filename: string
  fileType: string
  fileSize: number
  content?: string | null
  summary?: string | null
  glossary?: any
  flashcards?: any
  quiz?: any
  concepts?: any
  createdAt: string
  updatedAt: string
}

export interface DocumentProgress {
  id: string
  documentId: string
  stage: string
  status: string
  progress: number
  error?: string | null
  createdAt: string
  updatedAt: string
}

export interface LearningProgress {
  id: string
  userId: string
  documentId: string
  type: string
  itemId: string
  status: string
  score?: number | null
  attempts: number
  lastAnswer?: string | null
  createdAt: string
  updatedAt: string
}
