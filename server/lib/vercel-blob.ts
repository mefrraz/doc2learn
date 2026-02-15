import { put, del, head } from '@vercel/blob';

export interface BlobUploadResult {
  url: string;
  key: string;
}

/**
 * Upload a PDF buffer to Vercel Blob storage
 * @param buffer - The file buffer to upload
 * @param filename - The original filename
 * @returns The URL and key of the uploaded file
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<BlobUploadResult> {
  // Create a unique path with timestamp to avoid collisions
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const pathname = `documents/${timestamp}-${sanitizedFilename}`;

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: 'application/pdf',
    addRandomSuffix: true, // Adds random suffix to prevent overwrites
  });

  return {
    url: blob.url,
    key: blob.pathname,
  };
}

/**
 * Delete a file from Vercel Blob storage
 * @param url - The URL of the file to delete
 */
export async function deletePDF(url: string): Promise<void> {
  await del(url);
}

/**
 * Check if a file exists in Vercel Blob storage
 * @param url - The URL of the file to check
 * @returns True if the file exists, false otherwise
 */
export async function fileExists(url: string): Promise<boolean> {
  try {
    const blobInfo = await head(url);
    return blobInfo !== null;
  } catch {
    return false;
  }
}

/**
 * Get file metadata from Vercel Blob storage
 * @param url - The URL of the file
 * @returns File metadata or null if not found
 */
export async function getFileInfo(url: string) {
  try {
    return await head(url);
  } catch {
    return null;
  }
}
