import React from 'react'
import './ErrorBoundary.css'

type Props = { children?: React.ReactNode }
type State = { hasError: boolean; error?: Error | null }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleRetry = this.handleRetry.bind(this)
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for now; replace with telemetry if available
    console.error('ErrorBoundary caught an error', error, info)
  }

  handleRetry() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-root">
          <h2>Something went wrong</h2>
          <p>We had trouble rendering this part of the app.</p>
          {this.state.error && (
            <div className="error-boundary-details">
              <pre>{this.state.error.message}</pre>
            </div>
          )}
          <div className="error-boundary-actions">
            <button onClick={this.handleRetry}>Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children ?? null
  }
}
