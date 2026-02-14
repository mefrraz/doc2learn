# Doc2Learn

Transform your PDFs into interactive learning experiences with AI-powered quizzes, flashcards, glossaries, and summaries.

## Features

- 📄 **PDF Upload & Parsing** - Upload PDFs and extract text content automatically
- 🤖 **AI-Powered Learning** - Generate quizzes, flashcards, glossaries, and summaries using AI
- 🔑 **BYOK (Bring Your Own Key)** - Use your own API keys from OpenAI, Anthropic, Google, or Groq
- 💾 **Secure Storage** - Files stored securely on Cloudinary, data in PostgreSQL
- 🎯 **Interactive Learning** - Take quizzes, study flashcards, and track progress

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Storage**: Cloudinary
- **AI**: OpenAI, Anthropic, Google AI, Groq

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Cloudinary account (free tier works)
- At least one AI provider API key

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
   - `JWT_SECRET` - Random secret for JWT tokens
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
│   │   └── cloudinary.ts # Cloudinary client
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
- `POST /api/api-keys` - Add new API key
- `DELETE /api/api-keys/:id` - Delete API key

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret for JWT tokens | ✅ |
| `VITE_API_URL` | Backend API URL | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | Production |
| `OPENAI_API_KEY` | OpenAI API key (optional) | ❌ |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | ❌ |
| `GOOGLE_API_KEY` | Google AI API key (optional) | ❌ |
| `GROQ_API_KEY` | Groq API key (optional) | ❌ |

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
