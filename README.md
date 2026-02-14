# Doc2Learn

Transform your PDFs into interactive learning experiences with AI-powered quizzes, flashcards, glossaries, and summaries.

## Features

- 📄 **PDF Upload & Parsing** - Upload PDFs and extract text content automatically
- 🤖 **AI-Powered Learning** - Generate quizzes, flashcards, glossaries, and summaries using AI
- 🔐 **BYOK (Bring Your Own Key)** - Use your own API keys from OpenAI, Anthropic, Google, or Groq
- 🔒 **Secure Storage** - API keys encrypted with AES-256-GCM, files on Cloudinary, data in PostgreSQL
- 🎯 **Interactive Learning** - Take quizzes, study flashcards, and track progress
- 🌐 **Cross-Origin Ready** - Configured for Vercel + Render deployment

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Storage**: Cloudinary
- **AI**: OpenAI, Anthropic, Google AI, Groq (user-provided keys)
- **Security**: AES-256-GCM encryption for API keys

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Cloudinary account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/doc2learn.git
   cd doc2learn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - `DATABASE_URL` - PostgreSQL connection string (Neon)
   - `JWT_SECRET` - Random secret for JWT tokens (used also for API key encryption)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - From Cloudinary dashboard
   - `VITE_API_URL` - Backend URL (default: http://localhost:3001)

4. **Initialize the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   npm run dev:server
   
   # Or both at once
   npm run dev:all
   ```

6. **Open the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

7. **Configure your AI API Keys**
   - Go to **Settings** → **API Keys**
   - Add your API key from your preferred provider:
     - [OpenAI](https://platform.openai.com/api-keys)
     - [Anthropic](https://console.anthropic.com/settings/keys)
     - [Google AI](https://aistudio.google.com/app/apikey)
     - [Groq](https://console.groq.com/keys) (recommended for free tier)

## BYOK (Bring Your Own Key) Model

Doc2Learn uses a **user-provided API key** model, which means:

- ✅ **You control your costs** - No markup on AI usage
- ✅ **Your keys are secure** - Encrypted with AES-256-GCM before storage
- ✅ **Privacy first** - Keys are stored per-user, isolated in the database
- ✅ **No server configuration** - No need to set AI API keys in server environment

### How it works

1. You add your API key in **Settings** → **API Keys**
2. The key is encrypted using AES-256-GCM with a key derived from `JWT_SECRET`
3. When you generate content, the key is decrypted temporarily for the API call
4. The key is never logged or exposed in responses

### Supported Providers

| Provider | Models | Free Tier | Get API Key |
|----------|--------|-----------|-------------|
| **Groq** | Llama 3, Mixtral | ✅ Generous | [console.groq.com](https://console.groq.com/keys) |
| **OpenAI** | GPT-4, GPT-3.5 | ❌ Pay-per-use | [platform.openai.com](https://platform.openai.com/api-keys) |
| **Anthropic** | Claude 3 | ❌ Pay-per-use | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| **Google AI** | Gemini Pro | ✅ Limited | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

## Deployment

### Stack

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **GitHub** | Code hosting | ✅ |
| **Vercel** | Frontend hosting | ✅ |
| **Render** | Backend hosting | ✅ |
| **Neon** | PostgreSQL database | ✅ |
| **Cloudinary** | File storage | ✅ |

### Step-by-Step Deployment

#### 1. Database (Neon)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project called `doc2learn`
3. Copy the connection string (DATABASE_URL)

#### 2. File Storage (Cloudinary)

1. Go to [cloudinary.com](https://cloudinary.com) and create an account
2. Go to Dashboard and copy:
   - Cloud Name
   - API Key
   - API Secret

#### 3. Backend (Render)

1. Go to [render.com](https://render.com) and create an account
2. Create a new Web Service:
   - Connect your GitHub repository
   - Name: `doc2learn-api`
   - Runtime: Node
   - Build Command: `npm install && npm run db:generate`
   - Start Command: `npm run start`
3. Add environment variables:
   ```
   DATABASE_URL=<your-neon-connection-string>
   JWT_SECRET=<random-secret-string>
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   NODE_ENV=production
   FRONTEND_URL=<your-vercel-url>
   ```
4. Deploy and note your backend URL (e.g., `https://doc2learn-api.onrender.com`)

**Note:** You do NOT need to configure `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc. Users add their own keys via the interface.

#### 4. Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and create an account
2. Import your GitHub repository
3. Configure:
   - Framework Preset: Vite
   - Root Directory: ./
4. Add environment variable:
   ```
   VITE_API_URL=<your-render-backend-url>
   ```
5. Deploy

### Cross-Origin Authentication

The application is configured for cross-origin authentication between Vercel (frontend) and Render (backend):

- Cookies use `SameSite=None; Secure=true` for cross-origin requests
- CORS is configured to allow Vercel preview URLs
- Authentication works via both cookies and `Authorization: Bearer` header

## Project Structure

```
doc2learn/
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   │   ├── layout/        # AppShell, Sidebar, TopBar
│   │   ├── ui/            # Button, Card, Input, etc.
│   │   └── viewer/        # PDFViewer, MarkdownViewer
│   ├── lib/               # Utilities and config
│   ├── pages/             # Page components
│   │   ├── learning/      # Quiz, Flashcards, Glossary, Summary
│   │   └── settings/      # API Keys settings
│   └── stores/            # Zustand stores
├── server/                 # Backend Express app
│   ├── lib/               # Utilities
│   │   ├── ai/           # AI provider integrations
│   │   ├── cloudinary.ts # Cloudinary client
│   │   └── encryption.ts # AES-256-GCM encryption
│   ├── middleware/        # Auth, Upload middleware
│   └── routes/            # API routes
├── prisma/                 # Database schema
└── plans/                  # Documentation and plans
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents/upload` - Upload new document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/generate` - Generate AI content

### AI
- `POST /api/ai/chat` - General chat
- `POST /api/ai/documents/:id/chat` - Chat about document
- `POST /api/ai/documents/:id/summarize` - Generate summary
- `POST /api/ai/documents/:id/exercises` - Generate exercises

### API Keys (BYOK)
- `GET /api/api-keys` - List user's API keys
- `POST /api/api-keys` - Add new API key (encrypted)
- `DELETE /api/api-keys/:id` - Delete API key
- `PATCH /api/api-keys/:id/toggle` - Toggle key active status

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret for JWT tokens and API key encryption | ✅ |
| `VITE_API_URL` | Backend API URL | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | Production |

**Note:** AI provider API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `GROQ_API_KEY`) are **NOT** required in the server environment. Users add their own keys through the Settings interface.

## Security

- **API Keys**: Encrypted with AES-256-GCM before storage
- **Authentication**: JWT tokens with 7-day expiration
- **Cookies**: `HttpOnly`, `Secure`, `SameSite=None` for cross-origin
- **CORS**: Configured for Vercel preview URLs

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
