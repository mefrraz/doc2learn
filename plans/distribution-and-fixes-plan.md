# Plano de Distribuição e Correções - Doc2Learn

## Stack de Deploy Definida

| Serviço | Função | Plano |
|---------|--------|-------|
| **GitHub** | Versionamento e código-fonte | Gratuito |
| **Vercel** | Frontend e deploy do site | Gratuito (Hobby) |
| **Render** | Backend/Server Express | Gratuito |
| **Neon** | PostgreSQL Database | Gratuito (0.5GB) |
| **Cloudinary** | Armazenamento de mídia/PDFs | Gratuito (25GB) |

---

## Arquitetura de Deploy

```mermaid
graph TB
    subgraph User [Usuário]
        Browser[Navegador]
    end
    
    subgraph GitHub [GitHub]
        Repo[Código-fonte]
    end
    
    subgraph Vercel [Vercel - Frontend]
        React[React App Build]
    end
    
    subgraph Render [Render - Backend]
        Express[Express Server]
        Prisma[Prisma ORM]
    end
    
    subgraph Neon [Neon - Database]
        PG[(PostgreSQL)]
    end
    
    subgraph Cloudinary [Cloudinary - Storage]
        Storage[PDF Storage]
    end
    
    subgraph AI [AI Providers - BYOK]
        OpenAI[OpenAI API]
        Anthropic[Anthropic API]
        Google[Google AI]
        Groq[Groq API]
    end
    
    Browser --> React
    React --> Express
    Express --> PG
    Express --> Storage
    Express --> AI
    GitHub --> Vercel
    GitHub --> Render
    
    style Vercel fill:#00E676,stroke:#333
    style Render fill:#46E3B7,stroke:#333
    style Neon fill:#3B82F6,stroke:#333
    style Cloudinary fill:#3448C5,stroke:#333
    style GitHub fill:#181717,stroke:#333,color:#fff

---

## Arquitetura de Deploy Proposta

```mermaid
graph TB
    subgraph User [Usuário]
        Browser[Navegador]
    end
    
    subgraph Vercel [Vercel - Frontend]
        React[React App]
        Static[Arquivos Estáticos]
    end
    
    subgraph Railway [Railway - Backend]
        Express[Express Server]
        Prisma[Prisma ORM]
    end
    
    subgraph Neon [Neon - Database]
        PG[(PostgreSQL)]
    end
    
    subgraph Supabase [Supabase - Storage]
        Storage[File Storage]
    end
    
    subgraph AI [AI Providers]
        OpenAI[OpenAI API]
        Anthropic[Anthropic API]
        Google[Google AI]
        Groq[Groq API]
    end
    
    Browser --> React
    React --> Express
    Express --> PG
    Express --> Storage
    Express --> AI
    
    style Vercel fill:#00E676,stroke:#333
    style Railway fill:#9F7AEA,stroke:#333
    style Neon fill:#3B82F6,stroke:#333
    style Supabase fill:#10B981,stroke:#333
```

---

## Mudanças Necessárias para Deploy

### 1. Migração de Database (SQLite → PostgreSQL)

**Arquivos a modificar:**
- `prisma/schema.prisma` - Alterar provider para postgresql
- `.env.example` - Atualizar DATABASE_URL

**Antes:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Depois:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Migração de File Storage (Local → Cloudinary)

**Arquivos a modificar:**
- `server/middleware/upload.ts` - Usar Cloudinary
- `server/routes/documents.ts` - Servir URLs da Cloudinary
- `server/index.ts` - Remover static serve de uploads

**Nova dependência:**
```bash
npm install cloudinary multer-storage-cloudinary
```

### 3. Configuração de Ambiente

**Novo arquivo: `src/lib/config.ts`**
```typescript
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  environment: import.meta.env.MODE,
}
```

### 4. Variáveis de Ambiente

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.seudominio.com
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://... (Neon)
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Estimativa de Esforço (Implementação por IA)

### Fase 1: Correções Críticas

| Tarefa | Complexidade | Arquivos |
|--------|--------------|----------|
| Corrigir rota `/learn` | Baixa | 2 |
| Corrigir layout PDF Viewer | Média | 2-3 |
| Centralizar configuração API | Baixa | 3-4 |

### Fase 2: Preparação para Deploy

| Tarefa | Complexidade | Arquivos |
|--------|--------------|----------|
| Migração PostgreSQL | Baixa | 2 |
| Implementar Storage em Nuvem | Média | 3-4 |
| Configurar CORS para produção | Baixa | 1 |
| Criar scripts de deploy | Baixa | 2-3 |

### Fase 3: Documentação

| Tarefa | Complexidade | Arquivos |
|--------|--------------|----------|
| README atualizado | Baixa | 1 |
| Guia de deploy | Baixa | 1 |

---

## Resumo de Arquivos a Modificar

```
Arquivos Modificados: ~15-20
Arquivos Criados: ~3-5
```

### Lista Detalhada:

**Modificar:**
1. `src/App.tsx` - Corrigir rotas
2. `src/pages/pdf-viewer.tsx` - Layout fullscreen
3. `src/components/layout/NewAppShell.tsx` - Suportar rotas fullscreen
4. `server/index.ts` - CORS production
5. `server/routes/documents.ts` - Cloud storage
6. `server/middleware/upload.ts` - Cloud storage
7. `prisma/schema.prisma` - PostgreSQL
8. `.env.example` - Novas variáveis
9. `package.json` - Novas dependências

**Criar:**
1. `src/lib/config.ts` - Configuração centralizada
2. `src/pages/learning-index.tsx` - Página índice de learning
3. `server/lib/cloudinary.ts` - Cliente Cloudinary
4. `vercel.json` - Config deploy frontend
5. `render.yaml` - Config deploy backend

---

## Próximos Passos

1. [ ] Implementar correções críticas (rotas e layout)
2. [ ] Migrar para PostgreSQL
3. [ ] Implementar storage em nuvem
4. [ ] Configurar variáveis de ambiente
5. [ ] Criar documentação de deploy
6. [ ] Testar deploy em staging

---

## Custos Estimados (Free Tier)

| Serviço | Plano | Limite |
|---------|-------|--------|
| GitHub | Free | Repositórios ilimitados |
| Vercel | Hobby | 100GB bandwidth/mês |
| Render | Free | 750 horas/mês |
| Neon | Free | 0.5GB storage |
| Cloudinary | Free | 25GB storage, 25GB bandwidth |

**Total: $0/mês** para uso pessoal/hobby
