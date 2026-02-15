# PDF Viewer UI/UX Improvements Plan

## Overview

This plan outlines the implementation of 4 UI/UX improvements for the PDF viewer:
1. Multiple Page Selection (max 5 pages)
2. Layout Consistency (align toolbar heights)
3. Multiline Textarea (up to 15 lines)
4. Theme Toggle (Light/Dark mode)

---

## 1. Multiple Page Selection (Max 5 Pages)

### Current State
- [`PDFViewer.tsx`](src/components/viewer/PDFViewer.tsx:19-20) accepts `selectedPages` and `onSelectedPagesChange` props
- [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx:42) has `selectedPages` state but no UI to select pages
- [`PDFThumbnails`](src/components/viewer/PDFViewer.tsx:310-359) component exists with selection support but is not used

### Proposed Changes

#### A. Create PageSelector Component
Create a new component [`src/components/viewer/PageSelector.tsx`](src/components/viewer/PageSelector.tsx):

```typescript
interface PageSelectorProps {
  totalPages: number
  selectedPages: number[]
  onSelectedPagesChange: (pages: number[]) => void
  maxPages?: number // Default: 5
}
```

Features:
- Grid of page thumbnails with checkboxes
- Visual indication of selected pages
- Counter showing "X/5 pages selected"
- Clear all button
- Only shown when user wants to select multiple pages

#### B. Add Page Selection UI to PDF Viewer
Modify [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx):

1. Add a "Select Pages" button in the header or chat panel
2. Show a modal/dropdown with [`PageSelector`](src/components/viewer/PageSelector.tsx)
3. Display selected pages in the chat context area
4. Enforce 5-page limit with validation

#### C. Update Chat Context
When multiple pages are selected:
- Fetch content for all selected pages
- Send all page contents to AI with page numbers
- Display "Pages 1, 3, 5" in chat context indicator

### Files to Modify
- [`src/pages/pdf-viewer.tsx`](src/pages/pdf-viewer.tsx) - Add selection UI
- [`src/components/viewer/PDFViewer.tsx`](src/components/viewer/PDFViewer.tsx) - Pass selection props
- Create: [`src/components/viewer/PageSelector.tsx`](src/components/viewer/PageSelector.tsx)

---

## 2. Layout Consistency (Align Toolbar Heights)

### Current State
- Top toolbar: [`PDFToolbar`](src/components/viewer/PDFToolbar.tsx:99) uses `px-4 py-2`
- Bottom status bar: Not present in current implementation
- Chat header: [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx:323-339) uses `p-4`

### Proposed Changes

#### A. Standardize Toolbar Heights
Define a consistent toolbar height variable:

```css
/* In index.css */
--toolbar-height: 48px;
```

#### B. Update PDFToolbar
Modify [`PDFToolbar.tsx`](src/components/viewer/PDFToolbar.tsx:99):
- Change from `px-4 py-2` to `h-12 px-4` (48px fixed height)
- Center content vertically with `items-center`

#### C. Add Bottom Status Bar
Add a status bar to [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx) below the PDF:
- Same height as top toolbar (48px)
- Contains: Chat toggle, Page indicator, Theme toggle
- Fixed at bottom of PDF area

### Layout Structure
```
┌─────────────────────────────────────────┐
│ Header (h-12)                           │ ← Document title, back button
├─────────────────────────────────────────┤
│ PDF Toolbar (h-12)                      │ ← Zoom, navigation, view mode
├─────────────────────────────────────────┤
│                                         │
│         PDF Content                     │
│                                         │
├─────────────────────────────────────────┤
│ Status Bar (h-12)                       │ ← Chat, page X/Y, theme
└─────────────────────────────────────────┘
```

### Files to Modify
- [`src/index.css`](src/index.css) - Add CSS variable
- [`src/components/viewer/PDFToolbar.tsx`](src/components/viewer/PDFToolbar.tsx) - Fix height
- [`src/pages/pdf-viewer.tsx`](src/pages/pdf-viewer.tsx) - Add status bar

---

## 3. Multiline Textarea (Up to 15 Lines)

### Current State
- Using `<Input>` component (single line)
- Located in [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx:416-423)
- Fixed height, no expansion

### Proposed Changes

#### A. Create Auto-Expanding Textarea
Create [`src/components/ui/textarea.tsx`](src/components/ui/textarea.tsx):

```typescript
interface TextareaProps {
  maxRows?: number // Default: 15
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  disabled?: boolean
}
```

Features:
- Auto-expands as user types
- Max 15 rows before scrolling
- Min 1 row (collapses when empty)
- Shift+Enter for new line
- Enter to send

#### B. Update Chat Input
Replace `<Input>` with new `<Textarea>` in:
- [`pdf-viewer.tsx`](src/pages/pdf-viewer.tsx:416-423)
- [`document-detail.tsx`](src/pages/document-detail.tsx) chat input

#### C. Adjust Layout
- Move send button to the right of textarea
- Allow textarea to grow upward
- Fixed padding at bottom of chat panel

### Files to Modify
- Create: [`src/components/ui/textarea.tsx`](src/components/ui/textarea.tsx)
- [`src/pages/pdf-viewer.tsx`](src/pages/pdf-viewer.tsx) - Replace Input
- [`src/pages/document-detail.tsx`](src/pages/document-detail.tsx) - Replace Input

---

## 4. Theme Toggle (Light/Dark Mode)

### Current State
- CSS variables defined in [`index.css`](src/index.css:8-100) for both themes
- `.dark` class toggles dark mode
- No UI to toggle theme

### Proposed Changes

#### A. Create Theme Store
Create [`src/stores/themeStore.ts`](src/stores/themeStore.ts):

```typescript
interface ThemeStore {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}
```

Features:
- Persist to localStorage
- Apply `.dark` class to document root
- Respect system preference on first load

#### B. Create ThemeToggle Component
Create [`src/components/ui/theme-toggle.tsx`](src/components/ui/theme-toggle.tsx):

```typescript
// Icon button with Sun/Moon icons
// Shows Sun in dark mode, Moon in light mode
```

#### C. Add to Status Bar
Add theme toggle to the new status bar in PDF viewer.

### Files to Modify
- Create: [`src/stores/themeStore.ts`](src/stores/themeStore.ts)
- Create: [`src/components/ui/theme-toggle.tsx`](src/components/ui/theme-toggle.tsx)
- [`src/pages/pdf-viewer.tsx`](src/pages/pdf-viewer.tsx) - Add toggle to status bar
- [`src/index.css`](src/index.css) - Ensure smooth transitions

---

## Implementation Order

1. **Theme Toggle** (Foundation)
   - Create theme store
   - Create toggle component
   - Add to layout

2. **Layout Consistency** (Structure)
   - Standardize toolbar heights
   - Add status bar
   - Reorganize layout

3. **Multiline Textarea** (Input)
   - Create textarea component
   - Replace inputs
   - Adjust chat layout

4. **Multiple Page Selection** (Feature)
   - Create page selector
   - Add to viewer
   - Update chat context

---

## Technical Considerations

### Performance
- Page thumbnails should be lazy-loaded
- Debounce textarea resize calculations
- Use CSS transitions for theme changes

### Accessibility
- Theme toggle should have aria-label
- Textarea should have proper focus states
- Page selector should be keyboard navigable

### Mobile Responsiveness
- Page selector should use bottom sheet on mobile
- Textarea should not exceed viewport height
- Toolbars should remain touch-friendly

---

## Files Summary

### New Files
- [`src/stores/themeStore.ts`](src/stores/themeStore.ts)
- [`src/components/ui/theme-toggle.tsx`](src/components/ui/theme-toggle.tsx)
- [`src/components/ui/textarea.tsx`](src/components/ui/textarea.tsx)
- [`src/components/viewer/PageSelector.tsx`](src/components/viewer/PageSelector.tsx)

### Modified Files
- [`src/pages/pdf-viewer.tsx`](src/pages/pdf-viewer.tsx)
- [`src/components/viewer/PDFToolbar.tsx`](src/components/viewer/PDFToolbar.tsx)
- [`src/pages/document-detail.tsx`](src/pages/document-detail.tsx)
- [`src/index.css`](src/index.css)

---

**Date**: 2026-02-15
**Status**: Ready for implementation
