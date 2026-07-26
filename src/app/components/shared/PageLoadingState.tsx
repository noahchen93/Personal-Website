import React from 'react';

interface PageLoadingStateProps {
  label?: string;
}

export default function PageLoadingState({
  label = 'Loading content…',
}: PageLoadingStateProps) {
  return (
    <div className="page-loading-state" role="status" aria-live="polite">
      <span className="page-loading-state__bar" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
