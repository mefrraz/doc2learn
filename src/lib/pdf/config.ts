import { pdfjs } from 'react-pdf'

// Configure PDF.js worker
// This is required for react-pdf to work
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

// Alternative: Use CDN if local worker doesn't work
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export { pdfjs }
