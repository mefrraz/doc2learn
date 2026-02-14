import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, User, Shield } from 'lucide-react'

export function SettingsPage() {
  const { t } = useTranslation()
  
  const settings = [
    {
      title: t('settings.apiKeys'),
      description: t('settings.apiKeysDesc'),
      icon: Key,
      href: '/settings/api-keys',
    },
    {
      title: t('settings.profile'),
      description: t('settings.profileDesc'),
      icon: User,
      href: '/settings/profile',
      disabled: true,
    },
    {
      title: t('settings.security'),
      description: t('settings.securityDesc'),
      icon: Shield,
      href: '/settings/security',
      disabled: true,
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.manageAccount', 'Manage your account and preferences')}
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
                  {t('settings.comingSoon')}
                </Button>
              ) : (
                <Link to={item.href}>
                  <Button variant="outline" className="w-full">
                    {t('settings.manage', 'Manage')}
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
