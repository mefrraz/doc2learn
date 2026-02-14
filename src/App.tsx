import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/stores/authStore'
import { AppShell } from '@/components/layout/NewAppShell'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { DashboardPage } from '@/pages/NewDashboard'
import { DocumentsPage } from '@/pages/documents'
import { DocumentDetailPage } from '@/pages/document-detail'
import { SettingsPage } from '@/pages/settings'
import { ApiKeysPage } from '@/pages/settings/api-keys'
import { LearningIndexPage } from '@/pages/learning-index'
import { LearningExperiencePage } from '@/pages/learning-experience'
import { QuizPage } from '@/pages/learning/quiz'
import { GlossaryPage } from '@/pages/learning/glossary'
import { SummaryPage } from '@/pages/learning/summary'
import { ExercisesPage } from '@/pages/learning/exercises'
import { FlashcardsPage } from '@/pages/learning/flashcards'
import { PDFViewerPage } from '@/pages/pdf-viewer'
import { ChatPage } from '@/pages/ChatPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  
  useEffect(() => {
    initialize()
  }, [initialize])
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        
        {/* Protected Routes with AppShell (sidebar, topbar) */}
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/:id" element={<DocumentDetailPage />} />
          <Route path="learn" element={<LearningIndexPage />} />
          <Route path="learn/:experienceId" element={<LearningExperiencePage />} />
          <Route path="learn/:experienceId/quiz" element={<QuizPage />} />
          <Route path="learn/:experienceId/glossary" element={<GlossaryPage />} />
          <Route path="learn/:experienceId/summary" element={<SummaryPage />} />
          <Route path="learn/:experienceId/exercises" element={<ExercisesPage />} />
          <Route path="learn/:experienceId/flashcards" element={<FlashcardsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/api-keys" element={<ApiKeysPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
        
        {/* Fullscreen Routes (outside AppShell) */}
        <Route 
          path="documents/:id/view" 
          element={<ProtectedRoute><PDFViewerPage /></ProtectedRoute>} 
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
