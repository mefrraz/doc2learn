import { createUploadthing, type FileRouter } from 'uploadthing/express'
import { UTApi } from 'uploadthing/server'
import type { Request, Response } from 'express'

const f = createUploadthing()

// UTApi client for server-side uploads
export const utapi = new UTApi()

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