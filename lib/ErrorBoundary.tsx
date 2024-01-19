import { Component } from 'react'

export class ErrorBoundary extends Component<
  {
    id: number
    fallback: ({ resetError }: { resetError: () => void }) => React.ReactNode
  },
  { hasError: boolean }
> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidUpdate(
    prevProps: Readonly<{ id: number; fallback: React.ReactNode }>
  ): void {
    // Reset error boundary if id changes
    // without this, the view will be stuck in `fallback` (even if you move to an id that doesn't throw)
    if (prevProps.id !== this.props.id) {
      this.setState({ hasError: false })
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    // logErrorToMyService(error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback({
        resetError: () => this.setState({ hasError: false }),
      })
    }

    return this.props.children
  }
}
