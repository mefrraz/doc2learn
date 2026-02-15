import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-text-primary mb-3 mt-4 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold text-text-primary mb-2 mt-3 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-text-primary mb-2 mt-2">
            {children}
          </h3>
        ),
        
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-3 last:mb-0 text-text-secondary leading-relaxed">
            {children}
          </p>
        ),
        
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1 text-text-secondary">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1 text-text-secondary">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-text-secondary">{children}</li>
        ),
        
        // Code blocks
        code: ({ className, children, ...props }) => {
          const isInline = !className
          
          if (isInline) {
            return (
              <code 
                className="bg-bg-tertiary text-text-primary px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            )
          }
          
          return (
            <code className={cn("block font-mono text-sm", className)} {...props}>
              {children}
            </code>
          )
        },
        pre: ({ children }) => (
          <pre className="bg-bg-tertiary border border-border rounded-lg p-4 overflow-x-auto mb-3 text-sm">
            {children}
          </pre>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover underline underline-offset-2"
          >
            {children}
          </a>
        ),
        
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-accent pl-4 py-1 my-3 bg-bg-tertiary/50 rounded-r text-text-secondary italic">
            {children}
          </blockquote>
        ),
        
        // Strong and emphasis
        strong: ({ children }) => (
          <strong className="font-semibold text-text-primary">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        
        // Horizontal rule
        hr: () => (
          <hr className="border-border my-4" />
        ),
        
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full border border-border rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-bg-tertiary">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-border px-3 py-2 text-left text-sm font-semibold text-text-primary">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-3 py-2 text-sm text-text-secondary">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
