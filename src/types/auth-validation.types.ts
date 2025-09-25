// Types for login validation state and errors

export interface FieldValidation {
  valid: boolean;
  error: string | null;
}

export interface AuthValidationState {
  email: FieldValidation;
  password: FieldValidation;
  formValid: boolean;
  loading: boolean;
  errorCategory?: 'validation' | 'auth' | 'network' | 'server';
  errorMessage?: string;
  rateLimit?: {
    attempts: number;
    nextAllowed: Date | null;
    delay: number;
  };
}

export interface RateLimitState {
  attempts: number;
  nextAllowed: Date | null;
  delay: number;
}
