/**
 * Error Boundary Component
 * Catches errors in the detector UI to prevent crashing the host app
 */
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      '[IODetector] UI Error caught by Error Boundary:',
      error,
      '\nComponent stack:',
      errorInfo.componentStack,
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Silent fail - return null to not affect host app
      return null;
    }

    return this.props.children;
  }
}
