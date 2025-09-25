'use client';

import { useState, useCallback } from 'react';
import { 
  User, 
  UpdateUserDTO, 
  ProfileResponse, 
  UpdateProfileResponse, 
  ProfileError,
  ProfileFormData 
} from '@/types/user.types';

interface UseProfileApiReturn {
  user: User | null;
  isLoading: boolean;
  error: ProfileError | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: UpdateUserDTO) => Promise<boolean>;
  clearError: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function useProfileApi(): UseProfileApiReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ProfileError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!userId) {
      setError({ message: 'User ID is required', code: 'MISSING_USER_ID' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ProfileResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      setUser(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError({ 
        message: errorMessage,
        code: errorMessage.includes('User_not_found') ? 'USER_NOT_FOUND' : 'FETCH_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updateData: UpdateUserDTO): Promise<boolean> => {
    if (!userId) {
      setError({ message: 'User ID is required', code: 'MISSING_USER_ID' });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UpdateProfileResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local user state with changed fields
      if (user) {
        setUser(prevUser => ({
          ...prevUser!,
          ...data.data,
        }));
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError({ 
        message: errorMessage,
        code: errorMessage.includes('User_not_found') ? 'USER_NOT_FOUND' : 'UPDATE_ERROR'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    user,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  };
}

// Helper function to map frontend form data to backend update format
export function mapFormDataToUpdateDTO(formData: ProfileFormData): UpdateUserDTO {
  return {
    name: formData.name.trim() || undefined,
    username: formData.username.trim() || undefined,
    email: formData.email.trim() || undefined,
    bio: formData.bio.trim() || undefined,
  };
}

// Helper function to split name for display purposes
export function splitName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName?.trim()) {
    return { firstName: '', lastName: '' };
  }
  
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  
  return { firstName, lastName };
}

// Helper function to combine names
export function combineName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}