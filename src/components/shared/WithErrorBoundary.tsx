
'use client'

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  WithErrorBoundary.displayName = `WithErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  return WithErrorBoundary;
};

export default withErrorBoundary;
