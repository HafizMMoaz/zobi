import { Component, ErrorInfo } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { ErrorAlert } from '../ErrorMessage';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './types';

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static defaultProps: Partial<ErrorBoundaryProps> = {
    showMessage: true,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    this.setState({ error, info });
  }

  render() {
    const { error, info } = this.state;
    const { showMessage, className } = this.props;
    if (error) {
      const firstLine = error.toString().split('\n')[0];
      if (showMessage) {
        return (
          <ErrorAlert
            errorType={t('Unexpected error')}
            message={firstLine}
            descriptionDetails={info?.componentStack}
            className={className}
          />
        );
      }
      return null;
    }
    return this.props.children;
  }
}

export type { ErrorBoundaryProps };
