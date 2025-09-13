import { LocationData } from './location.types'

// Service data structure from backend
export interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  min_price: number;
  max_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Freelancer information
export interface FreelancerInfo {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  reputation_score?: number;
}

// Service with freelancer information
export interface ServiceWithFreelancer extends Service {
  freelancer: FreelancerInfo;
}

// Filter options for service search
export interface ServiceFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  keyword?: string;
  page?: number;
  limit?: number;
  location?: LocationData
  searchRadius?: number
  timezones?: string[]
  
}

// API Response interfaces
export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: Service | ServiceWithFreelancer;
}

export interface ServicesListResponse {
  success: boolean;
  message: string;
  data?: ServiceWithFreelancer[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_services: number;
    per_page: number;
  };
}

// Frontend freelancer display interface (mapped from service)
export interface FreelancerDisplay {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviewCount: number;
  location: string;
  hourlyRate: number;
  description: string;
  skills: string[];
  projectsCompleted: number;
  responseTime: string;
  category: string;
  coordinates?: { lat: number; lng: number }
  timezone?: string
  isTopRated?: boolean
}

// Search hook return type
export interface UseServicesApiReturn {
  services: FreelancerDisplay[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    total_pages: number;
    total_services: number;
    per_page: number;
  } | null;
  searchServices: (filters: ServiceFilters) => Promise<void>;
  clearError: () => void;
}
