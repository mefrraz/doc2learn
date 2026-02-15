# PDF Viewer Improvements Plan

## Overview

This plan addresses 7 major improvements to the PDF viewer and chat interface:

1. Page selector functionality
2. Two-page spread view
3. Rendering performance optimization
4. Resizable chat panel
5. Markdown rendering for AI responses
6. Summarize and Exercises functionality
7. Light mode button visibility

---

## 1. Page Selector Enhancement

### Current State
The [`PageJumpInput`](src/components/viewer/PageJumpInput.tsx) component exists and appears functional. It provides:
- Numeric input for direct page entry
- Keyboard navigation (Enter to confirm, Escape to cancel)
- Input validation

### Issues to Fix
- Verify the component is receiving correct props
- Add dropdown for quick page selection as alternative

### Implementation
```typescript
// Add dropdown mode to PageJumpInput
interface PageJumpInputProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  mode?: 'input' | 'dropdown' | 'both'
  className?: string
}
```

---

## 2. Two-Page Spread View

### Current State
[`ViewMode`](src/components/viewer/PDFToolbar.tsx:8) only supports `'single'` and `'continuous'`.

### Implementation

#### Update Types
```typescript
// src/components/viewer/PDFToolbar.tsx
export type ViewMode = 'single' | 'continuous' | 'spread'
```

#### Update Toolbar
Add third button for spread view:
```tsx
<button
  onClick={() => onViewModeChange('spread')}
  className={...}
  title="Two-page spread view"
>
  <BookOpen className="w-4 h-4" />
</button>
```

#### Update PDFViewer Component
```tsx
// In PDFViewer.tsx, add spread view rendering
{viewMode === 'spread' && (
  <div className="flex gap-2 justify-center">
    <Page pageNumber={currentPage} scale={scale} />
    {currentPage < numPages && (
      <Page pageNumber={currentPage + 1} scale={scale} />
    )}
  </div>
)}
```

#### Navigation Logic for Spread
- Next page: `currentPage + 2`
- Previous page: `currentPage - 2`
- Always start on odd page numbers (1, 3, 5...)

---

## 3. Rendering Performance Optimization

### Current Issues
- ~400ms delay when zooming or changing pages
- No prefetching of adjacent pages
- No caching of rendered pages

### Implementation Strategy

#### 3.1 Page Cache Hook
Create `src/hooks/usePDFPageCache.ts`:
```typescript
interface PageCacheOptions {
  pdfDocument: PDFDocumentProxy | null
  prefetchCount: number // Pages to prefetch ahead
  maxCacheSize: number  // Maximum cached pages
}

export function usePDFPageCache(options: PageCacheOptions) {
  const cache = useRef(new Map<number, RenderedPage>())
  
  // Prefetch adjacent pages
  const prefetchPages = useCallback(async (currentPage: number) => {
    const pagesToFetch = []
    for (let i = 1; i <= options.prefetchCount; i++) {
      if (currentPage + i <= totalPages) pagesToFetch.push(currentPage + i)
      if (currentPage - i >= 1) pagesToFetch.push(currentPage - i)
    }
    // Fetch and cache pages...
  }, [])
  
  return { getCachedPage, prefetchPages, clearCache }
}
```

#### 3.2 Lazy Loading with Skeleton
```tsx
// Add loading skeleton for pages
const PageSkeleton = () => (
  <div className="animate-pulse bg-bg-tertiary rounded-lg" 
       style={{ width: 600 * scale, height: 800 * scale }}>
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
    </div>
  </div>
)
```

#### 3.3 Virtual Scrolling for Continuous Mode
Use `react-window` or implement custom virtualization:
```typescript
// Only render visible pages + buffer
const visibleRange = useVisibilityDetector(containerRef)
const pagesToRender = Array.from(
  { length: visibleRange.end - visibleRange.start + 1 },
  (_, i) => visibleRange.start + i
)
```

#### 3.4 Web Worker for PDF Processing
Create `src/workers/pdfWorker.ts`:
```typescript
// Offload heavy PDF operations to web worker
self.onmessage = (e) => {
  const { type, data } = e.data
  switch (type) {
    case 'extractText':
      // Extract text from page
      break
    case 'renderPage':
      // Render page to offscreen canvas
      break
  }
}
```

---

## 4. Resizable Chat Panel

### Current State
Fixed width of 384px in [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx:398).

### Implementation

#### 4.1 Create ResizablePanel Component
Create `src/components/ui/resizable.tsx`:
```typescript
interface ResizablePanelProps {
  defaultWidth: number
  minWidth: number
  maxWidth: number
  children: React.ReactNode
  side: 'left' | 'right'
  onWidthChange?: (width: number) => void
}

export function ResizablePanel({
  defaultWidth,
  minWidth = 300,
  maxWidth = 600,
  children,
  side,
  onWidthChange
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }
  
  useEffect(() => {
    if (!isResizing) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = side === 'right' 
        ? window.innerWidth - e.clientX 
        : e.clientX
      setWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)))
    }
    
    const handleMouseUp = () => setIsResizing(false)
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])
  
  return (
    <div style={{ width }} className="relative">
      {children}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-1 cursor-col-resize",
          "hover:bg-accent/50 transition-colors",
          isResizing && "bg-accent"
        )}
        style={{ [side]: 0 }}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}
```

#### 4.2 Update pdf-viewer.tsx
```tsx
<ResizablePanel
  defaultWidth={400}
  minWidth={320}
  maxWidth={600}
  side="left"
>
  {/* Chat content */}
</ResizablePanel>
```

---

## 5. Markdown Rendering for AI Responses

### Current State
AI responses displayed as plain text in [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx:460).

### Dependencies
Already installed: `react-markdown`, `remark-gfm`, `rehype-highlight`

### Implementation

#### 5.1 Create MarkdownRenderer Component
Create `src/components/ui/markdown-renderer.tsx`:
```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn('prose prose-sm max-w-none dark:prose-invert', className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // Custom component styling
        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
        code: ({ className, children }) => {
          const isInline = !className
          return isInline ? (
            <code className="bg-bg-tertiary px-1 rounded text-sm">{children}</code>
          ) : (
            <code className={className}>{children}</code>
          )
        },
        pre: ({ children }) => (
          <pre className="bg-bg-tertiary p-3 rounded-lg overflow-x-auto mb-2">
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

#### 5.2 Update Chat Messages
```tsx
// In pdf-viewer.tsx, replace plain text with MarkdownRenderer
<MarkdownRenderer content={message.content} />

// For summary
<MarkdownRenderer content={summary} />
```

---

## 6. Summarize and Exercises Functionality

### Current State
Endpoints exist in [`server/routes/ai.ts`](server/routes/ai.ts:156) but may have issues.

### Issues to Investigate
1. API endpoint paths - verify frontend matches backend
2. Error handling - ensure proper error messages
3. Loading states - verify UI feedback

### Frontend API Path Check
```typescript
// Frontend calls:
apiEndpoint(`api/ai/documents/${id}/summarize`)

// Backend route:
router.post('/documents/:id/summarize', ...)
// Mounted at: /api/ai
// Full path: /api/ai/documents/:id/summarize ✓
```

### Fixes Needed

#### 6.1 Add Better Error Handling
```typescript
// In pdf-viewer.tsx handleSummarize
const response = await fetch(...)

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.error || `HTTP ${response.status}`)
}
```

#### 6.2 Add Retry Logic
```typescript
const withRetry = async (fn: () => Promise<Response>, retries = 2) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fn()
      if (response.ok) return response
    } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}
```

#### 6.3 Verify Content is Passed
```typescript
// Ensure document.content exists before calling
if (!document?.content) {
  toast({
    variant: 'destructive',
    title: 'No Content',
    description: 'This document has no text content to process.',
  })
  return
}
```

---

## 7. Light Mode Button Visibility

### Current State
CSS variables defined in [`src/index.css`](src/index.css:8).

### Issues
Buttons may have low contrast in light mode due to:
- `text-text-secondary` being too light
- Background colors matching text colors

### Audit Required

#### 7.1 Button Classes to Check
```css
/* Light mode values */
--text-secondary: #666666  /* May be too light on some backgrounds */
--bg-tertiary: #F5F0EB    /* Light background */
```

#### 7.2 Fixes
```css
/* Improve contrast in light mode */
:root {
  --text-secondary: #4A4A4A;  /* Darker for better contrast */
}

/* Or add specific button overrides */
.btn-outline {
  @apply border-border-strong text-text-primary;
}
```

#### 7.3 Component Audit
Check these components for light mode issues:
- [`PDFToolbar.tsx`](src/components/viewer/PDFToolbar.tsx) - All buttons
- [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx:346) - "Learning Mode" button
- Chat panel buttons

---

## Implementation Order

1. **Phase 1: Critical Fixes** (Priority)
   - [ ] Fix light mode button visibility
   - [ ] Fix Summarize/Exercises API calls
   - [ ] Add Markdown rendering

2. **Phase 2: UX Improvements**
   - [ ] Make chat panel resizable
   - [ ] Add two-page spread view
   - [ ] Enhance page selector

3. **Phase 3: Performance**
   - [ ] Implement page caching
   - [ ] Add prefetching
   - [ ] Add lazy loading with skeletons

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/viewer/PDFToolbar.tsx` | Add spread view button |
| `src/components/viewer/PDFViewer.tsx` | Add spread view rendering, caching |
| `src/components/viewer/PageJumpInput.tsx` | Add dropdown option |
| `src/pages/pdf-viewer.tsx` | Resizable panel, Markdown, API fixes |
| `src/components/ui/resizable.tsx` | New file - resizable panel |
| `src/components/ui/markdown-renderer.tsx` | New file - Markdown renderer |
| `src/index.css` | Light mode contrast fixes |
| `src/hooks/usePDFPageCache.ts` | New file - page caching |

---

## Testing Checklist

- [ ] Page navigation works in all view modes
- [ ] Spread view displays two pages correctly
- [ ] Page changes are smooth with prefetching
- [ ] Chat panel can be resized
- [ ] AI responses render with proper formatting
- [ ] Summarize generates content
- [ ] Exercises are generated and interactive
- [ ] All buttons visible in light mode
- [ ] All buttons visible in dark mode
