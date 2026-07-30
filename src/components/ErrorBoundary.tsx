import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#f8fafc', background: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>
            应用发生错误
          </h1>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '14px', color: '#94a3b8' }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px', color: '#64748b', marginTop: '16px' }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            重新加载
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
