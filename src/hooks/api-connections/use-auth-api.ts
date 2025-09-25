'use client';

import { useCallback, useState } from 'react';
import {
  User,
  CreateUserDTO,
  ApiResponse,
  ProfileError as AuthError,
} from '@/types/user.types';

type UseAuthApiReturn = {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  registerUser: (payload: CreateUserDTO) => Promise<User | null>;
  fetchUserById: (userId: string) => Promise<User | null>;
  clearError: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useAuthApi(): UseAuthApiReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const registerUser = useCallback(async (payload: CreateUserDTO): Promise<User | null> => {
    const { wallet_address, username } = payload;

    if (!wallet_address || !username) {
      setError({ message: 'Missing_required_fields', code: 'VALIDATION_ERROR' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse<User> = await response.json().catch(() => ({
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: null as unknown as User,
      }));

      if (!response.ok || !data.success) {
        const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      setUser(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration_failed';
      setError({ message, code: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (userId: string): Promise<User | null> => {
    if (!userId) {
      setError({ message: 'User_ID_is_required', code: 'MISSING_USER_ID' });
      return null;
    }

    if (!uuidRegex.test(userId)) {
      setError({ message: 'Invalid_user_ID_format', code: 'INVALID_ID' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data: ApiResponse<User> = await response.json().catch(() => ({
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: null as unknown as User,
      }));

      if (!response.ok || !data.success) {
        const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      setUser(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch_failed';
      setError({ message, code: message.includes('User_not_found') ? 'USER_NOT_FOUND' : 'FETCH_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading, error, registerUser, fetchUserById, clearError };
}


