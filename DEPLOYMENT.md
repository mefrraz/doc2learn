# Guia de Deploy - Doc2Learn

## Variáveis de Ambiente Necessárias

### Backend (Render)

| Variável | Descrição | Obrigatório | Onde Obter |
|----------|-----------|-------------|------------|
| `DATABASE_URL` | String de conexão PostgreSQL | **Sim** | Neon Dashboard |
| `JWT_SECRET` | Chave secreta para JWT tokens | **Sim** | Gerar string aleatória |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud Cloudinary | **Sim** | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary | **Sim** | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary | **Sim** | Cloudinary Dashboard |
| `FRONTEND_URL` | URL do frontend (Vercel) | **Sim** | Após deploy Vercel |
| `NODE_ENV` | Ambiente de execução | Auto | Render define automaticamente |
| `PORT` | Porta do servidor | Auto | Render define automaticamente |
| `OPENAI_API_KEY` | Chave API OpenAI | Opcional* | OpenAI Platform |
| `ANTHROPIC_API_KEY` | Chave API Anthropic | Opcional* | Anthropic Console |
| `GOOGLE_API_KEY` | Chave API Google AI | Opcional* | Google AI Studio |
| `GROQ_API_KEY` | Chave API Groq | Opcional* | Groq Console |

*Nota: As chaves de AI são opcionais no servidor porque o app usa modelo BYOK (Bring Your Own Key) - cada usuário pode cadastrar suas próprias chaves.

### Frontend (Vercel)

| Variável | Descrição | Obrigatório | Onde Obter |
|----------|-----------|-------------|------------|
| `VITE_API_URL` | URL do backend (Render) | **Sim** | Após deploy Render |

---

## Passo a Passo de Deploy

### 1. Preparar Contas

Crie contas nos seguintes serviços (todos têm plano gratuito):

1. **Neon** (https://neon.tech) - PostgreSQL
2. **Cloudinary** (https://cloudinary.com) - Storage de arquivos
3. **Render** (https://render.com) - Backend
4. **Vercel** (https://vercel.com) - Frontend

### 2. Configurar Neon (PostgreSQL)

1. Acesse https://neon.tech e faça login
2. Clique em "Create a project"
3. Nome: `doc2learn`
4. Região: escolha a mais próxima
5. Após criar, copie a **Connection string** (DATABASE_URL)
   - Formato: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/doc2learn?sslmode=require`

### 3. Configurar Cloudinary

1. Acesse https://cloudinary.com e faça login
2. Vá para **Dashboard**
3. Copie os valores:
   - **Cloud Name**: `CLOUDINARY_CLOUD_NAME`
   - **API Key**: `CLOUDINARY_API_KEY`
   - **API Secret**: `CLOUDINARY_API_SECRET`

### 4. Deploy do Backend (Render)

1. Acesse https://render.com e faça login
2. Clique em **New** > **Web Service**
3. Conecte seu repositório GitHub: `mefrraz/doc2learn`
4. Configure:
   - **Name**: `doc2learn-api`
   - **Runtime**: Node
   - **Region**: Oregon (ou mais próximo)
   - **Branch**: main
   - **Build Command**: `npm install && npm run db:generate`
   - **Start Command**: `npm run start`
   - **Instance Type**: Free

5. Em **Advanced** > **Environment Variables**, adicione:

   ```
   DATABASE_URL=postgresql://... (do Neon)
   JWT_SECRET=gerar-string-aleatorio-seguro
   CLOUDINARY_CLOUD_NAME=seu-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=seu-api-secret
   FRONTEND_URL=https://doc2learn.vercel.app
   NODE_ENV=production
   ```

   Para gerar `JWT_SECRET`:
   ```bash
   # No terminal:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. Clique em **Deploy Web Service**
7. Aguarde o deploy completar
8. Anote a URL do backend: `https://doc2learn-api.onrender.com`

### 5. Deploy do Frontend (Vercel)

1. Acesse https://vercel.com e faça login
2. Clique em **Add New** > **Project**
3. Importe o repositório: `mefrraz/doc2learn`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Em **Environment Variables**, adicione:
   ```
   VITE_API_URL=https://doc2learn-api.onrender.com
   ```

6. Clique em **Deploy**
7. Aguarde o deploy completar
8. Anote a URL: `https://doc2learn.vercel.app`

### 6. Atualizar CORS (Importante!)

1. Volte ao Render
2. Vá em **Environment Variables**
3. Atualize `FRONTEND_URL` para a URL exata do Vercel:
   ```
   FRONTEND_URL=https://doc2learn.vercel.app
   ```
4. O Render fará redeploy automático

---

## Comandos Git para Enviar Alterações

### Verificar Status Atual
```bash
git status
```

### Adicionar Todas as Alterações
```bash
git add .
```

### Verificar o que Será Commitado
```bash
git status
```

### Criar Commit
```bash
git commit -m "feat: implement full deployment setup

- Fix /learn route with index page
- Fix PDF viewer fullscreen layout
- Centralize API configuration
- Remove duplicate AppShell
- Add Cloudinary integration
- Configure CORS for production
- Add Vercel and Render deployment configs
- Update documentation"
```

### Verificar Remote
```bash
git remote -v
```

Se não tiver o remote configurado:
```bash
git remote add origin https://github.com/mefrraz/doc2learn.git
```

### Enviar para GitHub
```bash
# Primeiro push (se o repositório for novo)
git push -u origin main

# Pushs subsequentes
git push
```

### Se houver conflito com remote
```bash
# Puxar alterações primeiro
git pull origin main --rebase

# Depois enviar
git push
```

---

## Verificação Pós-Deploy

### Backend
Acesse: `https://doc2learn-api.onrender.com/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "environment": "production"
}
```

### Frontend
Acesse: `https://doc2learn.vercel.app`

Deve carregar a página de login.

---

## Troubleshooting

### Erro de CORS
- Verifique se `FRONTEND_URL` no Render está correto
- Verifique se a URL do Vercel está acessível

### Erro de Database
- Verifique se `DATABASE_URL` está correto
- Execute migrations: adicione `npm run db:push` ao build command

### Erro no Cloudinary
- Verifique se as 3 variáveis estão corretas
- Teste upload diretamente no Cloudinary Dashboard

### Build Falha no Render
- Verifique os logs em **Logs** tab
- Comum: dependências faltando, variáveis de ambiente incorretas