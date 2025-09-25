import React from 'react';

interface ValidationErrorProps {
  error: string | null;
  id?: string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ error, id }) => {
  if (!error) return null;
  return (
    <div
      id={id}
      role='alert'
      aria-live='assertive'
      className='text-red-600 text-sm mt-1'
      tabIndex={-1}
    >
      {error}
    </div>
  );
};

export default ValidationError;
