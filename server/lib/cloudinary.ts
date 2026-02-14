import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { Readable } from 'stream'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  publicId: string
  url: string
  secureUrl: string
  resourceType: string
  bytes: number
  format: string
}

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'doc2learn/pdfs'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
        resource_type: 'raw', // Use 'raw' for PDFs and other documents
        use_filename: true,
        unique_filename: true,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'))
          return
        }

        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format,
        })
      }
    )

    // Convert buffer to stream and pipe to upload stream
    const readableStream = new Readable()
    readableStream.push(fileBuffer)
    readableStream.push(null)
    readableStream.pipe(uploadStream)
  })
}

/**
 * Delete a file from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    })
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return false
  }
}

/**
 * Get a signed URL for secure file access
 */
export function getSignedUrl(publicId: string, expiresIn: number = 3600): string {
  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    resource_type: 'raw',
  })
}

/**
 * Generate a secure URL with transformation options
 */
export function getSecureUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'raw',
  })
}

export { cloudinary }
