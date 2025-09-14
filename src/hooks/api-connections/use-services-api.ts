'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  ServiceFilters, 
  ServicesListResponse, 
  ServiceWithFreelancer,
  FreelancerDisplay,
  UseServicesApiReturn 
} from '@/types/service.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper function to map service data to freelancer display format
function mapServiceToFreelancerDisplay(service: ServiceWithFreelancer): FreelancerDisplay {
  // Extract skills from description or use default skills based on category
  const getSkillsFromCategory = (category: string): string[] => {
    const skillMap: Record<string, string[]> = {
      development: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Web Development'],
      design: ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'Visual Design'],
      marketing: ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Google Analytics'],
      business: ['Financial Analysis', 'Business Planning', 'Strategy', 'Consulting'],
      data: ['Machine Learning', 'Python', 'Data Analysis', 'Statistics', 'NLP'],
      security: ['Cryptography', 'Blockchain', 'Security Analysis', 'Rust', 'C++'],
      blockchain: ['Solidity', 'Cairo', 'Soroban', 'DeFi', 'Smart Contracts'],
    };
    
    return skillMap[category.toLowerCase()] || ['General Skills'];
  };

  // Generate a realistic rating based on reputation score or random
  const getRating = (reputationScore?: number): number => {
    if (reputationScore) {
      // Map reputation score (0-100) to rating (1-5)
      return Math.max(1, Math.min(5, (reputationScore / 20) + 3));
    }
    // Random rating between 3.5 and 5 for demo purposes
    return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
  };

  // Generate review count based on rating
  const getReviewCount = (rating: number): number => {
    const baseCount = Math.floor(Math.random() * 100) + 20;
    return Math.floor(baseCount * (rating / 4));
  };

  // Generate response time based on rating
  const getResponseTime = (rating: number): string => {
    if (rating >= 4.5) return 'Under 1 hour';
    if (rating >= 4) return '1-2 hours';
    if (rating >= 3.5) return '2-3 hours';
    return 'Under 3 hours';
  };

  // Generate projects completed based on rating and experience
  const getProjectsCompleted = (rating: number): number => {
    const baseProjects = Math.floor(Math.random() * 50) + 10;
    return Math.floor(baseProjects * (rating / 4));
  };

  // Generate location (placeholder for now)
  const getLocation = (): string => {
    const locations = [
      'New York, USA', 'London, UK', 'San Francisco, USA', 'Toronto, Canada',
      'Berlin, Germany', 'Miami, USA', 'Dubai, UAE', 'Tokyo, Japan',
      'Barcelona, Spain', 'Moscow, Russia', 'Buenos Aires, Argentina'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const rating = getRating(service.freelancer.reputation_score);
  const reviewCount = getReviewCount(rating);
  const responseTime = getResponseTime(rating);
  const projectsCompleted = getProjectsCompleted(rating);
  const location = getLocation();
  const skills = getSkillsFromCategory(service.category);

  return {
    id: service.id,
    name: service.freelancer.name || 'Anonymous Freelancer',
    title: service.title,
    rating,
    reviewCount,
    location,
    hourlyRate: service.min_price, // Use min_price as hourly rate
    description: service.description,
    skills,
    projectsCompleted,
    responseTime,
    category: service.category,
  };
}

export function useServicesApi(): UseServicesApiReturn {
  const [services, setServices] = useState<FreelancerDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    current_page: number;
    total_pages: number;
    total_services: number;
    per_page: number;
  } | null>(null);

  // URL sync hooks
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref to track if we're updating URL to prevent infinite loops
  const isUpdatingURL = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to update URL with search parameters
  const updateURL = useCallback((filters: ServiceFilters) => {
    if (isUpdatingURL.current) return; // Prevent recursive updates
    
    isUpdatingURL.current = true;
    
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove parameters based on filters
    if (filters.keyword) {
      params.set('q', filters.keyword);
    } else {
      params.delete('q');
    }
    
    if (filters.category) {
      params.set('category', filters.category);
    } else {
      params.delete('category');
    }
    
    if (filters.min_price !== undefined) {
      params.set('min', filters.min_price.toString());
    } else {
      params.delete('min');
    }
    
    if (filters.max_price !== undefined) {
      params.set('max', filters.max_price.toString());
    } else {
      params.delete('max');
    }
    
    if (filters.page && filters.page > 1) {
      params.set('page', filters.page.toString());
    } else {
      params.delete('page');
    }
    
    if (filters.limit && filters.limit !== 10) {
      params.set('limit', filters.limit.toString());
    } else {
      params.delete('limit');
    }

    const newURL = `${pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingURL.current = false;
    }, 100);
  }, [searchParams, router, pathname]);

  // Helper function to parse URL parameters into filters
  const parseURLParams = useCallback((): ServiceFilters => {
    const filters: ServiceFilters = {
      page: 1,
      limit: 10
    };

    const keyword = searchParams.get('q');
    if (keyword) filters.keyword = keyword;

    const category = searchParams.get('category');
    if (category) filters.category = category;

    const minPrice = searchParams.get('min');
    if (minPrice) filters.min_price = parseFloat(minPrice);

    const maxPrice = searchParams.get('max');
    if (maxPrice) filters.max_price = parseFloat(maxPrice);

    const page = searchParams.get('page');
    if (page) filters.page = parseInt(page);

    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit);

    return filters;
  }, [searchParams]);

  const searchServices = useCallback(async (filters: ServiceFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update URL with current filters (but only if not already updating)
      if (!isUpdatingURL.current) {
        updateURL(filters);
      }

      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.min_price !== undefined) params.append('min', filters.min_price.toString());
      if (filters.max_price !== undefined) params.append('max', filters.max_price.toString());
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/services?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ServicesListResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch services');
      }

      // Map services to freelancer display format
      const mappedServices = (data.data || []).map(mapServiceToFreelancerDisplay);
      
      setServices(mappedServices);
      setPagination(data.pagination || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      setError(errorMessage);
      setServices([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateURL]);

  // Debounced search function
  const debouncedSearch = useCallback(async (filters: ServiceFilters, delay: number = 300) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Return a Promise that resolves when the search is complete
    return new Promise<void>((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        await searchServices(filters);
        resolve();
      }, delay);
    });
  }, [searchServices]);

  // Load initial data from URL parameters only on mount or when URL actually changes
  useEffect(() => {
    const urlFilters = parseURLParams();
    
    // Only search if we're not currently updating the URL
    if (!isUpdatingURL.current) {
      searchServices(urlFilters);
    }
  }, [searchParams.toString()]); // Use searchParams.toString() to detect actual changes

  return {
    services,
    isLoading,
    error,
    pagination,
    searchServices: debouncedSearch,
    clearError,
  };
}
