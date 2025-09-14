type PublicUser = Omit<User, 'nonce' | 'created_at'>;

export interface CreateUserDTO {
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
}

export interface User {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  nonce?: string;
  created_at?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_freelancer?: boolean;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_users: number;
  per_page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UsersListResponse extends ApiResponse<PublicUser[]> {
  pagination: PaginationInfo;
}
