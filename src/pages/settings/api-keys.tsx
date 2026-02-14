import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Key, Plus, Trash2, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiEndpoint } from '@/lib/config'
import type { ApiKey } from '@/lib/types'

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' },
  { id: 'groq', name: 'Groq' },
  { id: 'cerebras', name: 'Cerebras' },
  { id: 'openrouter', name: 'OpenRouter' },
] as const

export function ApiKeysPage() {
  const { user, token } = useAuthStore()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [newKey, setNewKey] = useState('')
  const [newKeyName, setNewKeyName] = useState('')
  const { toast } = useToast()

  const fetchApiKeys = async () => {
    if (!user || !token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(apiEndpoint('api/api-keys'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [user, token])

  const handleAddKey = async (provider: string) => {
    if (!newKey || !token) return

    try {
      const response = await fetch(apiEndpoint('api/api-keys'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          provider,
          key: newKey,
          name: newKeyName || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save API key')
      }

      toast({
        title: 'Success',
        description: `API key for ${provider} saved successfully`,
      })

      setNewKey('')
      setNewKeyName('')
      setIsAdding(null)
      fetchApiKeys()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save API key',
      })
    }
  }

  const handleDeleteKey = async (id: string, provider: string) => {
    if (!token) return

    try {
      await fetch(apiEndpoint(`api/api-keys/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      toast({
        title: 'Success',
        description: `API key for ${provider} deleted`,
      })

      fetchApiKeys()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete API key',
      })
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Link to="/settings">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your AI provider API keys (BYOK)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Add your own API keys to use with Doc2Learn. Your keys are encrypted and stored securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            PROVIDERS.map((provider) => {
              const existingKey = apiKeys.find(k => k.provider === provider.id)
              
              return (
                <div key={provider.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{provider.name}</p>
                        {existingKey ? (
                          <p className="text-sm text-muted-foreground">
                            Key ending in ••••{existingKey.keyLast4}
                            {existingKey.name && ` (${existingKey.name})`}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not configured</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {existingKey ? (
                        <>
                          <span className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteKey(existingKey.id, provider.name)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      ) : isAdding === provider.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="password"
                            placeholder="Enter API key"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            className="w-48"
                          />
                          <Input
                            placeholder="Name (optional)"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="w-32"
                          />
                          <Button size="sm" onClick={() => handleAddKey(provider.id)}>
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsAdding(null)
                              setNewKey('')
                              setNewKeyName('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAdding(provider.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Key
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About BYOK</CardTitle>
          <CardDescription>
            How Doc2Learn handles your API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Your API keys are hashed before storage</li>
            <li>• Keys are only used when making requests to AI providers</li>
            <li>• Doc2Learn stores a secure hash of your keys</li>
            <li>• You can delete your keys at any time</li>
            <li>• You are billed directly by the AI providers for usage</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
