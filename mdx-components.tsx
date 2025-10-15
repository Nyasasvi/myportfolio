import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        marginTop: '2rem'
      }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '0.75rem',
        marginTop: '1.5rem'
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ 
        fontSize: '1.5rem', 
        fontWeight: '600', 
        marginBottom: '0.5rem',
        marginTop: '1.25rem'
      }}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ 
        marginBottom: '1rem', 
        lineHeight: '1.8',
        fontSize: '1.1rem'
      }}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul style={{ 
        marginBottom: '1rem', 
        paddingLeft: '2rem',
        lineHeight: '1.8'
      }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ 
        marginBottom: '1rem', 
        paddingLeft: '2rem',
        lineHeight: '1.8'
      }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ marginBottom: '0.5rem' }}>
        {children}
      </li>
    ),
    code: ({ children }) => (
      <code style={{
        backgroundColor: 'var(--neutral-alpha-weak)',
        padding: '0.2rem 0.4rem',
        borderRadius: '0.25rem',
        fontSize: '0.9em',
        fontFamily: 'monospace'
      }}>
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre style={{
        backgroundColor: 'var(--neutral-background-strong)',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        overflow: 'auto',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        lineHeight: '1.6'
      }}>
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: '4px solid var(--brand-medium)',
        paddingLeft: '1.5rem',
        marginLeft: '0',
        marginBottom: '1.5rem',
        fontStyle: 'italic',
        opacity: '0.9'
      }}>
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.95rem'
        }}>
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th style={{
        border: '1px solid var(--border-neutral-medium)',
        padding: '0.75rem',
        backgroundColor: 'var(--neutral-alpha-weak)',
        fontWeight: 'bold',
        textAlign: 'left'
      }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{
        border: '1px solid var(--border-neutral-medium)',
        padding: '0.75rem'
      }}>
        {children}
      </td>
    ),
    a: ({ href, children }) => (
      <a 
        href={href}
        style={{
          color: 'var(--brand-medium)',
          textDecoration: 'underline',
          fontWeight: '500'
        }}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    hr: () => (
      <hr style={{
        border: 'none',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--border-neutral-medium), transparent)',
        margin: '2rem 0'
      }} />
    ),
    ...components,
  }
}

