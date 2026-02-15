# Bug Fix and Restructure Plan

## Issues to Fix

### 1. Page Context Bug
**Problem**: When user asks about page 7, the system analyzes page 6.

**Root Cause**: Race condition between `setCurrentPage` and `setPageContent`. When user navigates to page 7 and quickly sends a message, `currentPage` is 7 but `pageContent` might still be from page 6.

**Solution**: 
- Store `pageContent` with its associated page number
- When sending message, use the page number that corresponds to the actual content
- Or wait for page content extraction before enabling chat

### 2. Document Detail Page Restructure

**Current State**:
- 3 learning options: Summary, Quiz, Glossary
- Summary shown as full-width card at bottom
- No chat functionality before opening viewer

**New Design**:
- 2 learning options: Quiz, Glossary (remove Summary option)
- Compact summary at top with markdown rendering
- Document chat panel available before opening viewer
- Summary should be shorter (truncated with "Read more")

## Implementation Plan

### Phase 1: Fix Page Context Bug

#### File: `src/pages/pdf-viewer.tsx`

```typescript
// Change from separate state to combined state
const [pageContext, setPageContext] = useState<{
  pageNumber: number;
  content: string;
} | null>(null);

// Update handler
const handlePageContent = useCallback((content: string, page: number) => {
  setPageContext({ pageNumber: page, content });
}, []);

// When sending message, use pageContext
body: JSON.stringify({
  message: userMessage,
  selectedText,
  pageContent: pageContext?.content,
  pageNumber: pageContext?.pageNumber,
  // ...
}),
```

### Phase 2: Restructure Document Detail Page

#### File: `src/pages/document-detail.tsx`

**Changes**:
1. Remove Summary from learningOptions array (keep Quiz and Glossary)
2. Add compact summary section at top with:
   - Markdown rendering
   - Max 3 lines with "Read more" expand
   - Only show if summary exists
3. Add document chat component:
   - Simple chat interface
   - Uses document.content as context
   - Available before opening viewer

#### New Component: `src/components/document/DocumentChat.tsx`

```typescript
interface DocumentChatProps {
  documentId: string;
  documentContent: string;
  documentTitle: string;
}

// Simple chat that uses full document content as context
// No page-specific context needed
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/pdf-viewer.tsx` | Fix page context synchronization |
| `src/pages/document-detail.tsx` | Restructure layout, add chat |
| `src/components/document/DocumentChat.tsx` | New file - document chat |
| `src/components/ui/markdown-renderer.tsx` | Add compact mode prop |

## Visual Layout (Document Detail Page)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Documents                                          │
├─────────────────────────────────────────────────────────────┤
│ 📄 Document Title                                            │
│ 1.5 MB • Uploaded Jan 15, 2024          [Open in Viewer]    │
├─────────────────────────────────────────────────────────────┤
│ 📝 Summary                                                   │
│ This document covers the basics of HTML including...        │
│ structure, elements, and attributes. [Read more]            │
├─────────────────────────────────────────────────────────────┤
│ 💬 Chat about this document                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Ask questions about the document...                     │ │
│ │ [input                                    ] [Send]      │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Learning Options                                             │
│ ┌──────────────────┐  ┌──────────────────┐                  │
│ │ ❓ Quiz          │  │ 📚 Glossary      │                  │
│ │ Test your        │  │ Learn key terms  │                  │
│ │ knowledge        │  │ and definitions  │                  │
│ │ [Start]          │  │ [Start]          │                  │
│ └──────────────────┘  └──────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```
