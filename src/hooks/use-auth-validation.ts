import { useState, useCallback } from 'react';
import {
  isValidEmail,
  isStrongPassword,
  requiredField,
} from '@/utils/validation-rules';
import {
  getNextRateLimitState,
  resetRateLimit,
  isRateLimited,
} from '@/utils/rate-limiting';
import type {
  AuthValidationState,
  RateLimitState,
} from '@/types/auth-validation.types';

const initialRateLimit: RateLimitState = {
  attempts: 0,
  delay: 0,
  nextAllowed: null,
};

export function useAuthValidation() {
  const [state, setState] = useState<AuthValidationState>({
    email: { valid: false, error: null },
    password: { valid: false, error: null },
    formValid: false,
    loading: false,
    errorCategory: undefined,
    errorMessage: undefined,
    rateLimit: initialRateLimit,
  });

  // Real-time field validation
  const validateEmail = useCallback((email: string) => {
    if (!requiredField(email)) {
      return { valid: false, error: 'Email is required.' };
    }
    if (!isValidEmail(email)) {
      return { valid: false, error: 'Enter a valid email address.' };
    }
    return { valid: true, error: null };
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (!requiredField(password)) {
      return { valid: false, error: 'Password is required.' };
    }
    if (!isStrongPassword(password)) {
      return {
        valid: false,
        error:
          'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.',
      };
    }
    return { valid: true, error: null };
  }, []);

  // Handle field changes
  const onFieldChange = useCallback(
    (field: 'email' | 'password', value: string) => {
      setState((prev) => {
        const validation =
          field === 'email' ? validateEmail(value) : validatePassword(value);
        const newState = {
          ...prev,
          [field]: validation,
          formValid:
            (field === 'email' ? validation.valid : prev.email.valid) &&
            (field === 'password' ? validation.valid : prev.password.valid),
          errorCategory: undefined,
          errorMessage: undefined,
        };
        return newState;
      });
    },
    [validateEmail, validatePassword],
  );

  // Handle login attempt
  const onLogin = useCallback(
    async (
      email: string,
      password: string,
      loginFn: (email: string, password: string) => Promise<void>,
    ) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        errorCategory: undefined,
        errorMessage: undefined,
      }));
      // Client-side validation
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePassword(password);
      if (!emailValidation.valid || !passwordValidation.valid) {
        setState((prev) => ({
          ...prev,
          email: emailValidation,
          password: passwordValidation,
          formValid: false,
          loading: false,
          errorCategory: 'validation',
          errorMessage:
            emailValidation.error || passwordValidation.error || undefined,
        }));
        return;
      }
      // Rate limiting
      setState((prev) => {
        if (prev.rateLimit && isRateLimited(prev.rateLimit)) {
          return {
            ...prev,
            loading: false,
            errorCategory: 'auth',
            errorMessage: `Too many failed attempts. Try again in ${Math.ceil(
              (prev.rateLimit.nextAllowed!.getTime() - Date.now()) / 1000,
            )}s.`,
          };
        }
        return prev;
      });
      try {
        await loginFn(email, password);
        setState((prev) => ({
          ...prev,
          loading: false,
          errorCategory: undefined,
          errorMessage: undefined,
          rateLimit: resetRateLimit(),
        }));
      } catch (err: unknown) {
        // Type guards for error object
        function hasMessage(e: unknown): e is { message: string } {
          return (
            typeof e === 'object' &&
            e !== null &&
            'message' in e &&
            typeof (e as { message: unknown }).message === 'string'
          );
        }
        function hasResponseStatus(
          e: unknown,
        ): e is { response: { status: number } } {
          return (
            typeof e === 'object' &&
            e !== null &&
            'response' in e &&
            typeof (e as { response: unknown }).response === 'object' &&
            (e as { response: { status?: unknown } }).response !== null &&
            typeof (e as { response: { status?: unknown } }).response.status ===
              'number'
          );
        }
        // Network error
        if (hasMessage(err) && err.message.includes('Network')) {
          setState((prev) => ({
            ...prev,
            loading: false,
            errorCategory: 'network',
            errorMessage: 'Network error. Please check your connection.',
          }));
          return;
        }
        // Server error
        if (hasResponseStatus(err) && err.response.status >= 500) {
          setState((prev) => ({
            ...prev,
            loading: false,
            errorCategory: 'server',
            errorMessage: 'Server error. Please try again later.',
          }));
          return;
        }
        // Auth failure
        setState((prev) => {
          const nextRate = getNextRateLimitState(
            prev.rateLimit || initialRateLimit,
          );
          return {
            ...prev,
            loading: false,
            errorCategory: 'auth',
            errorMessage: 'Invalid email or password.',
            rateLimit: nextRate,
          };
        });
      }
    },
    [validateEmail, validatePassword],
  );

  return {
    state,
    onFieldChange,
    onLogin,
  };
}
