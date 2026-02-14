import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, User, Shield } from 'lucide-react'

export function SettingsPage() {
  const settings = [
    {
      title: 'API Keys',
      description: 'Manage your AI provider API keys',
      icon: Key,
      href: '/settings/api-keys',
    },
    {
      title: 'Profile',
      description: 'Update your account information',
      icon: User,
      href: '/settings/profile',
      disabled: true,
    },
    {
      title: 'Security',
      description: 'Password and authentication settings',
      icon: Shield,
      href: '/settings/security',
      disabled: true,
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.map((item) => (
          <Card key={item.title} className={item.disabled ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.disabled ? (
                <Button variant="outline" disabled className="w-full">
                  Coming Soon
                </Button>
              ) : (
                <Link to={item.href}>
                  <Button variant="outline" className="w-full">
                    Manage
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
