"use client";

import { useState, useCallback } from "react";
import { Service } from "@/types/service.types";

// Frontend service interface for the form
export interface FrontendService {
  id: string;
  title: string;
  description: string;
  category: string;
  min_price: number;
  max_price: number;
  currency?: string; // Frontend-only field
  user_id?: string;
}

// Service creation DTO for the form
export interface CreateServiceFormData {
  title: string;
  description: string;
  category: string;
  min_price: number;
  max_price: number;
  currency?: string;
}

// Service update DTO for the form
export interface UpdateServiceFormData {
  title?: string;
  description?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  currency?: string;
}

// API response interface
interface ServiceApiResponse {
  success: boolean;
  message: string;
  data?: Service;
}

interface ServicesListApiResponse {
  success: boolean;
  message: string;
  data?: Service[];
}

// Hook return interface
export interface UseFreelancerServicesApiReturn {
  services: FrontendService[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  createService: (
    serviceData: CreateServiceFormData,
    userId: string
  ) => Promise<boolean>;
  updateService: (
    serviceId: string,
    serviceData: UpdateServiceFormData,
    userId: string
  ) => Promise<boolean>;
  deleteService: (serviceId: string, userId: string) => Promise<boolean>;
  fetchUserServices: (userId: string) => Promise<void>;
  clearError: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Helper function to convert backend service to frontend format
const mapBackendToFrontend = (backendService: Service): FrontendService => {
  return {
    id: backendService.id,
    title: backendService.title,
    description: backendService.description,
    category: backendService.category,
    min_price: backendService.min_price,
    max_price: backendService.max_price,
    user_id: backendService.user_id,
    currency: "XLM", // Default currency, can be customized
  };
};

// Helper function to convert frontend service to backend format
const mapFrontendToBackend = (
  frontendService: CreateServiceFormData,
  userId: string
) => {
  return {
    user_id: userId,
    title: frontendService.title.trim(),
    description: frontendService.description.trim(),
    category: frontendService.category.trim(),
    min_price: frontendService.min_price,
    max_price: frontendService.max_price,
  };
};

export function useFreelancerServicesApi(): UseFreelancerServicesApiReturn {
  const [services, setServices] = useState<FrontendService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserServices = useCallback(async (userId: string) => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/services?user_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: ServicesListApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch services");
      }

      const mappedServices = (data.data || []).map(mapBackendToFrontend);
      setServices(mappedServices);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch services";
      setError(errorMessage);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createService = useCallback(
    async (
      serviceData: CreateServiceFormData,
      userId: string
    ): Promise<boolean> => {
      if (!userId) {
        setError("User ID is required");
        return false;
      }

      // Validate required fields
      if (
        !serviceData.title ||
        !serviceData.description ||
        !serviceData.category
      ) {
        setError("Title, description, and category are required");
        return false;
      }

      // Validate price range
      if (
        serviceData.min_price < 0 ||
        serviceData.max_price < 0 ||
        serviceData.min_price > serviceData.max_price
      ) {
        setError(
          "Invalid price range. Min price must be less than or equal to max price, and both must be positive."
        );
        return false;
      }

      setIsCreating(true);
      setError(null);

      try {
        const backendData = mapFrontendToBackend(serviceData, userId);

        const response = await fetch(`${API_BASE_URL}/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle specific error cases
          if (response.status === 403) {
            throw new Error("Only freelancers can create services");
          }
          if (response.status === 404) {
            throw new Error("User not found");
          }
          if (response.status === 400) {
            throw new Error(errorData.message || "Invalid service data");
          }

          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data: ServiceApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to create service");
        }

        // Add the new service to the list
        if (data.data) {
          const newService = mapBackendToFrontend(data.data);
          setServices((prev) => [newService, ...prev]);
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create service";
        setError(errorMessage);
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateService = useCallback(
    async (
      serviceId: string,
      serviceData: UpdateServiceFormData,
      userId: string
    ): Promise<boolean> => {
      if (!userId || !serviceId) {
        setError("User ID and service ID are required");
        return false;
      }

      // Validate price range if both prices are provided
      if (
        serviceData.min_price !== undefined &&
        serviceData.max_price !== undefined
      ) {
        if (
          serviceData.min_price < 0 ||
          serviceData.max_price < 0 ||
          serviceData.min_price > serviceData.max_price
        ) {
          setError(
            "Invalid price range. Min price must be less than or equal to max price, and both must be positive."
          );
          return false;
        }
      }

      setIsUpdating(true);
      setError(null);

      try {
        // Prepare update data (only include provided fields)
        const updateData: any = {};
        if (serviceData.title !== undefined)
          updateData.title = serviceData.title.trim();
        if (serviceData.description !== undefined)
          updateData.description = serviceData.description.trim();
        if (serviceData.category !== undefined)
          updateData.category = serviceData.category.trim();
        if (serviceData.min_price !== undefined)
          updateData.min_price = serviceData.min_price;
        if (serviceData.max_price !== undefined)
          updateData.max_price = serviceData.max_price;

        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle specific error cases
          if (response.status === 403) {
            throw new Error("You can only update your own services");
          }
          if (response.status === 404) {
            throw new Error("Service not found");
          }
          if (response.status === 400) {
            throw new Error(errorData.message || "Invalid service data");
          }

          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data: ServiceApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to update service");
        }

        // Update the service in the list
        if (data.data) {
          const updatedService = mapBackendToFrontend(data.data);
          setServices((prev) =>
            prev.map((service) =>
              service.id === serviceId ? updatedService : service
            )
          );
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update service";
        setError(errorMessage);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const deleteService = useCallback(
    async (serviceId: string, userId: string): Promise<boolean> => {
      if (!userId || !serviceId) {
        setError("User ID and service ID are required");
        return false;
      }

      setIsDeleting(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle specific error cases
          if (response.status === 403) {
            throw new Error("You can only delete your own services");
          }
          if (response.status === 404) {
            throw new Error("Service not found");
          }

          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data: ServiceApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to delete service");
        }

        // Remove the service from the list
        setServices((prev) =>
          prev.filter((service) => service.id !== serviceId)
        );

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete service";
        setError(errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    []
  );

  return {
    services,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createService,
    updateService,
    deleteService,
    fetchUserServices,
    clearError,
  };
}
