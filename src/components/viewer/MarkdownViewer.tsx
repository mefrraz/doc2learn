import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Components } from 'react-markdown'

interface MarkdownViewerProps {
  content: string
  className?: string
}

// Custom components for markdown rendering
const components: Components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-text-primary font-sans">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3 text-text-primary font-sans">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-medium mt-4 mb-2 text-text-primary font-sans">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-medium mt-3 mb-2 text-text-primary font-sans">
      {children}
    </h4>
  ),
  
  // Paragraphs
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed">
      {children}
    </p>
  ),
  
  // Lists
  ul: ({ children }) => (
    <ul className="my-4 ml-6 list-disc space-y-1">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-6 list-decimal space-y-1">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">
      {children}
    </li>
  ),
  
  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent pl-4 py-2 my-4 bg-accent-light/50 rounded-r italic text-text-secondary">
      {children}
    </blockquote>
  ),
  
  // Code
  code: ({ className, children, ...props }) => {
    const isInline = !className
    
    if (isInline) {
      return (
        <code className="bg-bg-tertiary px-1.5 py-0.5 rounded text-sm font-mono text-accent" {...props}>
          {children}
        </code>
      )
    }
    
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-4 p-4 rounded-lg bg-bg-tertiary overflow-x-auto scrollbar-thin">
      {children}
    </pre>
  ),
  
  // Tables
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-bg-tertiary">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="border border-border px-4 py-2 text-left font-medium text-text-primary">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-4 py-2 text-text-secondary">
      {children}
    </td>
  ),
  
  // Links
  a: ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-accent hover:underline"
    >
      {children}
    </a>
  ),
  
  // Horizontal rule
  hr: () => (
    <hr className="my-8 border-border" />
  ),
  
  // Images
  img: ({ src, alt }) => (
    <img 
      src={src} 
      alt={alt} 
      className="max-w-full h-auto rounded-lg my-4"
    />
  ),
  
  // Strong and emphasis
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic">
      {children}
    </em>
  ),
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
