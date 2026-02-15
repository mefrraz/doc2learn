import { createUploadthing, type FileRouter } from 'uploadthing/express'
import { UTApi } from 'uploadthing/server'
import type { Request, Response } from 'express'

const f = createUploadthing()

// UTApi client for server-side uploads
// Support both new V7 token format and legacy UPLOADTHING_SECRET + UPLOADTHING_APP_ID
function createUTApi() {
  const token = process.env.UPLOADTHING_TOKEN;
  const secret = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;
  
  if (token) {
    // V7 format: base64 encoded JSON { apiKey, appId, regions }
    return new UTApi({ token });
  } else if (secret && appId) {
    // Legacy format: construct token from secret and appId
    const tokenData = {
      apiKey: secret,
      appId: appId,
      regions: ['us-east-1']
    };
    const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    return new UTApi({ token: encodedToken });
  } else {
    // No credentials - will fail at runtime
    console.warn('Warning: No Uploadthing credentials configured');
    return new UTApi();
  }
}

export const utapi = createUTApi();

// File router for PDF uploads (for direct client uploads if needed)
export const uploadRouter = {
  // PDF uploader route
  pdfUploader: f({
    pdf: {
      maxFileSize: '50MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }: { req: Request; res: Response }) => {
      // Get user from request (set by auth middleware)
      const user = (req as any).user
      
      if (!user) {
        throw new Error('Unauthorized')
      }
      
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.url)
      console.log('File key:', file.key)
      
      return { 
        fileUrl: file.url, 
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter