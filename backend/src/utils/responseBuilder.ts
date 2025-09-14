import { CreateResponse, ListResponse, ApiResponse } from '../types/api.type';

export const buildSuccessResponse = <T>(
  data: T,
  message: string
): CreateResponse<T> => ({
  success: true,
  message,
  data,
});

export const buildListResponse = <T>(
  data: T[],
  message: string
): ListResponse<T> => ({
  success: true,
  message,
  data,
});

export const buildErrorResponse = (
  message: string,
  data?: any
): ApiResponse => ({
  success: false,
  message,
  ...(data && { data }),
});

export const buildSuccessResponseWithoutData = (
  message: string
): ApiResponse => ({
  success: true,
  message,
});

export const buildPaginatedResponse = <T>(
  data: T[],
  message: string,
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  }
): ApiResponse<T[]> => ({
  success: true,
  message,
  data,
  pagination,
});
