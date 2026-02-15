# PDF Viewer Refactor Plan

## Overview

Refactor the PDF viewer component to support:
1. Proper PDF rendering (not just extracted text)
2. Navigation controls with page jump
3. Multi-page view (continuous scroll)
4. Page selector for chat context

## Current State Analysis

### Existing Dependencies
- `react-pdf`: ^7.7.3 (already installed)
- `pdfjs-dist`: ^5.4.624 (already installed)

### Current Implementation
- File: `src/components/viewer/PDFViewer.tsx`
- Uses `react-pdf` Document and Page components
- Single page view mode only
- Basic zoom and pagination controls
- Text selection support
- Thumbnail sidebar component

## Architecture

### Component Structure

```
src/components/viewer/
├── PDFViewer.tsx          # Main viewer component (refactored)
├── PDFToolbar.tsx         # Toolbar with controls (new)
├── PDFContinuousView.tsx  # Continuous scroll mode (new)
├── PageJumpInput.tsx      # Page jump input (new)
└── PDFThumbnails.tsx      # Thumbnail sidebar (existing, minor updates)

src/components/chat/
└── ChatPageSelector.tsx   # Page selector for chat context (new)
```

### Data Flow

```mermaid
flowchart LR
    A[PDFViewerPage] --> B[PDFViewer]
    A --> C[ChatPanel]
    
    B --> D[View Mode State]
    D --> E[single | continuous]
    
    B --> F[Current Page]
    B --> G[Total Pages]
    B --> H[Scale]
    
    C --> I[ChatPageSelector]
    I --> J[Selected Pages Array]
    J --> K[Chat Context]
```

## Implementation Tasks

### Phase 1: Core PDF Viewer Enhancements

#### Task 1.1: Add View Mode Toggle
- Add `viewMode` state: 'single' | 'continuous'
- Add toggle button in toolbar
- Persist preference in localStorage

#### Task 1.2: Implement Continuous Scroll Mode
- Create `PDFContinuousView` component
- Use virtual scrolling for performance
- Render multiple pages in a scrollable container
- Implement lazy loading for pages

#### Task 1.3: Add Page Jump Input
- Create `PageJumpInput` component
- Add input field in toolbar
- Validate page number input
- Handle Enter key and blur events

### Phase 2: Toolbar Refactoring

#### Task 2.1: Create PDFToolbar Component
- Extract toolbar from PDFViewer
- Include: view mode toggle, page navigation, page jump, zoom controls
- Add keyboard shortcuts (Arrow keys, +/-, Home/End)

#### Task 2.2: Enhance Navigation Controls
- Previous/Next page buttons
- First/Last page buttons
- Page input with validation
- Current page / Total pages display

### Phase 3: Chat Integration

#### Task 3.1: Create ChatPageSelector Component
- Multi-select interface for pages
- Visual page thumbnails with selection state
- Select all / Clear selection buttons
- Selected pages badge showing count

#### Task 3.2: Integrate with Chat Panel
- Add page selector above chat input
- Pass selected pages to chat API
- Display selected pages in message context

### Phase 4: Performance Optimizations

#### Task 4.1: Implement Virtual Scrolling
- Use react-window or react-virtualized
- Only render visible pages
- Maintain scroll position on mode switch

#### Task 4.2: Add Loading States
- Skeleton loading for pages
- Progressive loading indicator
- Error boundary for failed page renders

## Technical Specifications

### PDFViewer Props (Updated)

```typescript
interface PDFViewerProps {
  file: string | Blob | File
  viewMode?: 'single' | 'continuous'
  onTextSelect?: (text: string) => void
  onPageChange?: (page: number, totalPages: number) => void
  onPageContent?: (content: string, page: number) => void
  selectedPages?: number[]
  onSelectedPagesChange?: (pages: number[]) => void
  className?: string
}
```

### ChatPageSelector Props

```typescript
interface ChatPageSelectorProps {
  totalPages: number
  selectedPages: number[]
  onSelectionChange: (pages: number[]) => void
  file: string | Blob | File
  className?: string
}
```

### PageJumpInput Props

```typescript
interface PageJumpInputProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}
```

## File Changes Summary

### Files to Modify
1. `src/components/viewer/PDFViewer.tsx` - Major refactor
2. `src/pages/pdf-viewer.tsx` - Integrate new components

### Files to Create
1. `src/components/viewer/PDFToolbar.tsx`
2. `src/components/viewer/PDFContinuousView.tsx`
3. `src/components/viewer/PageJumpInput.tsx`
4. `src/components/chat/ChatPageSelector.tsx`

## Dependencies

No new dependencies required. Using existing:
- react-pdf (v7.7.3)
- pdfjs-dist (v5.4.624)
- lucide-react (for icons)
- framer-motion (for animations)

## Testing Checklist

- [ ] PDF renders correctly in single page mode
- [ ] PDF renders correctly in continuous scroll mode
- [ ] Page navigation works (prev/next/jump)
- [ ] Zoom controls work in both modes
- [ ] Text selection works in both modes
- [ ] Page selector integrates with chat
- [ ] Selected pages are passed to chat API
- [ ] Performance is acceptable with large PDFs
- [ ] Keyboard shortcuts work
- [ ] Mobile responsive design

## Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | Core enhancements | Medium |
| Phase 2 | Toolbar refactor | Low |
| Phase 3 | Chat integration | Medium |
| Phase 4 | Performance | Medium |

## Notes

- The current implementation already uses react-pdf correctly
- The issue might be with how the parent page uses the component
- Need to verify if pdfBlob is being passed correctly
- Consider adding error boundaries for better error handling
