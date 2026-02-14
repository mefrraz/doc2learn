# Handoff Document - Doc2Learn Project

## Current Objective

Migrate PDF storage from local filesystem to **Uploadthing** cloud storage to resolve ephemeral filesystem issues on Render deployment. This is part of a larger effort to deploy the application as a web app using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon (PostgreSQL)
- **File Storage**: Uploadthing (replacing local filesystem)
- **AI**: BYOK (Bring Your Own Key) model

## Current Work Status

### In Progress: Uploadthing Integration

The Uploadthing integration is partially complete. The following has been done:

1. **Installed** `uploadthing` package via npm
2. **Created** `server/lib/uploadthing.ts` with UTApi client and file router
3. **Updated** Prisma schema with `fileUrl` and `fileKey` fields
4. **Ran** `npx prisma db push` to sync database schema
5. **Updated** imports in `server/routes/documents.ts` (lines 1-9)

### Still Needs to Be Done in `server/routes/documents.ts`:

The upload route (line 100) still uses the old `uploadMiddleware` and disk-based storage. Need to update:

1. **Upload route** (`POST /upload`): Change from disk storage to memory storage + Uploadthing upload
2. **File serving route** (`GET /:id/file`): Change from streaming local file to redirect to Uploadthing URL
3. **Delete route** (`DELETE /:id`): Add Uploadthing file deletion when document is deleted

## Files Modified

### Created Files:
- `server/lib/uploadthing.ts` - Uploadthing client and file router
- `plans/pdf-storage-migration.md` - Migration plan document
- `src/lib/i18n/config.ts` - i18n configuration
- `src/lib/i18n/locales/en.json` - English translations
- `src/lib/i18n/locales/pt-PT.json` - Portuguese translations
- `src/components/ui/language-toggle.tsx` - Language switcher component
- `src/pages/learning-index.tsx` - Learning index page
- `DEPLOYMENT.md` - Deployment documentation
- `vercel.json` - Vercel configuration
- `render.yaml` - Render configuration

### Modified Files:
- `prisma/schema.prisma` - Added `fileUrl` and `fileKey` fields to Document model
- `server/routes/documents.ts` - Updated imports (partially complete)
- `server/index.ts` - CORS configuration for production
- `server/lib/encryption.ts` - AES-256-GCM encryption for API keys
- `server/routes/api-keys.ts` - User API key management
- `server/routes/ai.ts` - BYOK integration
- `src/App.tsx` - Routing fixes, removed duplicate AppShell
- `src/lib/config.ts` - Centralized API endpoint configuration
- `src/stores/authStore.ts` - Use centralized API endpoint
- `src/components/layout/NewAppShell.tsx` - Language toggle integration
- `README.md` - Updated documentation

### Deleted Files:
- `src/components/layout/app-shell.tsx` - Duplicate AppShell removed

## Task List

### Completed:
- [x] Analyze project and identify issues
- [x] Evaluate distribution strategy (Online vs Local) - **Decision: Online deployment**
- [x] Create detailed plan for fixes and deployment
- [x] Fix `/learn` route (created `learning-index.tsx`)
- [x] Fix PDF Viewer layout (moved outside AppShell)
- [x] Centralize API URL configuration (`src/lib/config.ts`)
- [x] Remove duplicate AppShell (kept `NewAppShell`)
- [x] Configure CORS for production
- [x] Create deployment config files (`vercel.json`, `render.yaml`)
- [x] Update documentation (README, DEPLOYMENT.md)
- [x] Fix TypeScript errors for Vercel build
- [x] Implement BYOK (Bring Your Own Key) for AI APIs
- [x] Create reversible encryption for user API keys (AES-256-GCM)
- [x] Implement i18n system (English + Portuguese)
- [x] Install Uploadthing package
- [x] Create Uploadthing client (`server/lib/uploadthing.ts`)
- [x] Update Prisma schema with `fileUrl` and `fileKey`

### In Progress:
- [ ] **Migrate PDF storage to Uploadthing** (currently at: updating documents.ts routes)

### Pending:
- [ ] Update upload route to use memory storage + Uploadthing
- [ ] Update file serving route to redirect to Uploadthing URL
- [ ] Update delete route to delete from Uploadthing
- [ ] Verify `server/middleware/upload.ts` has memory storage middleware
- [ ] Update `.env.example` with Uploadthing variables
- [ ] Test upload and PDF viewing functionality
- [ ] Add page context extraction for PDF chat
- [ ] Add language instruction in AI prompts based on user preference

## Immediate Next Step

**Continue updating `server/routes/documents.ts`:**

The file currently has updated imports but the routes still use the old disk-based approach. Need to:

1. Read the current state of `server/middleware/upload.ts` to verify it exports `uploadMemoryMiddleware` and `UploadedMemoryFile`
2. Update the upload route (line 100) to:
   - Use `uploadMemoryMiddleware` instead of `uploadMiddleware`
   - Parse PDF from `file.buffer` instead of `fs.readFileSync(file.path)`
   - Upload to Uploadthing using `utapi.uploadFiles()`
   - Store `fileUrl` and `fileKey` instead of `filePath`
3. Update the file serving route to redirect to `document.fileUrl`
4. Update the delete route to call `utapi.deleteFiles([document.fileKey])`

## Technical Decisions Made

### Storage Solution
- **Chosen**: Uploadthing
- **Reason**: Free tier (2GB), automatic CDN, simple API, works well with Vercel/Render
- **Alternatives considered**: AWS S3 (complex), Vercel Blob (paid), Cloudinary (PDF focus)

### AI API Model
- **Chosen**: BYOK (Bring Your Own Key)
- **Reason**: Users provide their own API keys, no server costs for AI, supports multiple providers
- **Providers supported**: OpenAI, Anthropic, Google AI, Groq

### Encryption
- **Algorithm**: AES-256-GCM
- **Key derivation**: PBKDF2 with server secret
- **Storage**: Keys stored encrypted in database, decrypted at runtime

### Internationalization
- **Library**: react-i18next
- **Languages**: English (en), Portuguese Portugal (pt-PT)
- **Storage**: Language preference stored in localStorage

### Deployment Architecture
```
Frontend (Vercel) -> Backend (Render) -> Database (Neon) -> Files (Uploadthing)
                                    -> AI (User's API Keys)
```

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="..."
SERVER_SECRET="..."  # For API key encryption

# Uploadthing (NEW - needs to be added)
UPLOADTHING_SECRET="..."  # From uploadthing.com dashboard
UPLOADTHING_APP_ID="..."  # From uploadthing.com dashboard

# Frontend
VITE_API_URL="https://your-backend.onrender.com"
```

## Key Code Patterns

### Uploadthing Client Usage
```typescript
import { utapi } from '../lib/uploadthing';

// Upload file
const uploadResult = await utapi.uploadFiles([{
  name: file.originalname,
  type: file.mimetype,
  data: file.buffer,
}]);

// Get URL and key
const fileUrl = uploadResult[0].data.url;
const fileKey = uploadResult[0].data.key;

// Delete file
await utapi.deleteFiles([fileKey]);
```

### Memory Storage Middleware
```typescript
import { uploadMemoryMiddleware, UploadedMemoryFile } from '../middleware/upload';

router.post('/upload', uploadMemoryMiddleware.single('file'), async (req, res) => {
  const file = req.file as UploadedMemoryFile;
  // file.buffer contains the file data in memory
});
```

## Commands to Resume Work

```bash
# Check current state of documents.ts
cat server/routes/documents.ts | head -20

# Check upload middleware
cat server/middleware/upload.ts

# Run database sync (if needed)
npx prisma db push

# Test build
npm run build
```

## Related Documentation

- `plans/pdf-storage-migration.md` - Detailed migration plan
- `DEPLOYMENT.md` - Deployment instructions
- `README.md` - Project overview and setup

---

**Last Updated**: 2026-02-14
**Session Status**: Paused during Uploadthing route migration
**Next Action**: Update `server/routes/documents.ts` routes for Uploadthing