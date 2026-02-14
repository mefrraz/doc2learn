import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Construction } from 'lucide-react'

export function ExercisesPage() {
  const { experienceId } = useParams<{ experienceId: string }>()

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Link to={`/learn/${experienceId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Construction className="w-8 h-8 text-yellow-500" />
            <div>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>AI-generated exercises coming soon</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Exercise generation will be available once AI integration is complete.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
