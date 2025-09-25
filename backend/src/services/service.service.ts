import { supabase } from '@/lib/supabase/supabase';
import {
  CreateServiceDTO,
  UpdateServiceDTO,
  ServiceFilters,
  Service,
  ServiceWithFreelancer,
} from '@/types/service.types';
import { BadRequestError, ForbiddenError, NotFoundError ,InternalServerError} from '@/utils/AppError';
class ServiceService {
  async createService(serviceData: CreateServiceDTO): Promise<Service> {
    const { user_id, title, description, category, min_price, max_price } =
      serviceData;

    // First, verify that the user exists and is a freelancer
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, is_freelancer')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      throw new NotFoundError('User not found');
    }

    if (!user.is_freelancer) {
      throw new ForbiddenError('User is not a freelancer');
    }

    // Create the service
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        user_id,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        min_price,
        max_price,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        user_id,
        title,
        description,
        category,
        min_price,
        max_price,
        is_active,
        created_at,
        updated_at
      `
      )
      .single();

    if (error) {
      throw new InternalServerError(`Failed to create service: ${error.message}`);
    }

    return service;
  }

  async getAllServices(
    filters: ServiceFilters
  ): Promise<{ services: ServiceWithFreelancer[]; total: number }> {
    const {
      category,
      min_price,
      max_price,
      keyword,
      page = 1,
      limit = 10,
    } = filters;

    let query = supabase
      .from('services')
      .select(
        `
        id,
        user_id,
        title,
        description,
        category,
        min_price,
        max_price,
        is_active,
        created_at,
        updated_at,
        users!inner (
        id,
        name,
        username,
        email,
        is_freelancer
      )
      `,
        { count: 'exact' }
      )
      .eq('is_active', true);

    // Apply filters
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    if (min_price !== undefined) {
      query = query.gte('min_price', min_price);
    }

    if (max_price !== undefined) {
      query = query.lte('max_price', max_price);
    }

    if (keyword) {
      query = query.or(
        `title.ilike.%${keyword}%,description.ilike.%${keyword}%`
      );
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: services, error, count } = await query;

    if (error) {
      throw new InternalServerError(`Failed to fetch services: ${error.message}`);
    }

    // Transform the data to include freelancer info
    const servicesWithFreelancer: ServiceWithFreelancer[] = (
      services || []
    ).map((service) => {
      // Handle the case where users might be an array or object
      const user = Array.isArray(service.users)
        ? service.users[0]
        : service.users;

      return {
        id: service.id,
        user_id: service.user_id,
        title: service.title,
        description: service.description,
        category: service.category,
        min_price: service.min_price,
        max_price: service.max_price,
        is_active: service.is_active,
        created_at: service.created_at,
        updated_at: service.updated_at,
        freelancer: {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          email: user?.email,
        },
      };
    });

    return {
      services: servicesWithFreelancer,
      total: count || 0,
    };
  }

  async getServiceById(
    serviceId: string
  ): Promise<ServiceWithFreelancer | null> {
    const { data: service, error } = await supabase
      .from('services')
      .select(
        `
        id,
        user_id,
        title,
        description,
        category,
        min_price,
        max_price,
        is_active,
        created_at,
        updated_at,
     users!inner (
        id,
        name,
        username,
        email,
        bio,
        is_freelancer
      )
      `
      )
      .eq('id', serviceId)
      .eq('is_active', true)
      .single();

    if (error || !service) {
      return null;
    }

    // Handle the case where users might be an array or object
    const user = Array.isArray(service.users)
      ? service.users[0]
      : service.users;

    return {
      id: service.id,
      user_id: service.user_id,
      title: service.title,
      description: service.description,
      category: service.category,
      min_price: service.min_price,
      max_price: service.max_price,
      is_active: service.is_active,
      created_at: service.created_at,
      updated_at: service.updated_at,
      freelancer: {
        id: user?.id,
        name: user?.name,
        username: user?.username,
        email: user?.email,
        bio: user?.bio,
      },
    };
  }

  async updateService(
    serviceId: string,
    updateData: UpdateServiceDTO,
    userId?: string
  ): Promise<Service | null> {
    // First, check if the service exists and get the owner
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('id, user_id')
      .eq('id', serviceId)
      .single();

    if (fetchError || !existingService) {
      return null;
    }

    // If userId is provided, check ownership
    if (userId && existingService.user_id !== userId) {
      throw new ForbiddenError('Unauthorized: You can only update your own services');
    }

    // Prepare update data
    const updatedData: any = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    // Trim string fields
    if (updatedData.title) updatedData.title = updatedData.title.trim();
    if (updatedData.description)
      updatedData.description = updatedData.description.trim();
    if (updatedData.category)
      updatedData.category = updatedData.category.trim();

    const { data: service, error } = await supabase
      .from('services')
      .update(updatedData)
      .eq('id', serviceId)
      .select(
        `
        id,
        user_id,
        title,
        description,
        category,
        min_price,
        max_price,
        is_active,
        created_at,
        updated_at
      `
      )
      .single();

    if (error) {
      throw new InternalServerError(`Failed to update service: ${error.message}`);
    }

    return service;
  }

  async deleteService(serviceId: string, userId?: string): Promise<boolean> {
    // First, check if the service exists and get the owner
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('id, user_id')
      .eq('id', serviceId)
      .single();

    if (fetchError || !existingService) {
      return false;
    }

    // If userId is provided, check ownership
    if (userId && existingService.user_id !== userId) {
      throw new ForbiddenError('Unauthorized: You can only delete your own services');
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('services')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(), // Make sure this column exists now
      })
      .eq('id', serviceId);

    if (error) {
      throw new InternalServerError(`Failed to delete service: ${error.message}`);
    }

    return true;
  }

  // Additional utility methods
  async getServicesByUserId(userId: string): Promise<Service[]> {
    const { data: services, error } = await supabase
      .from('services')
      .select(
        `
        id,
        user_id,
        title,
        description,
        category,
        min_price,
        max_price,
        is_active,
        created_at,
        updated_at
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerError(`Failed to fetch user services: ${error.message}`);
    }

    return services || [];
  }

  async getServiceCategories(): Promise<string[]> {
    const { data: categories, error } = await supabase
      .from('services')
      .select('category')
      .eq('is_active', true);

    if (error) {
      throw new InternalServerError(`Failed to fetch categories: ${error.message}`);
    }

    // Get unique categories
    const uniqueCategories = [
      ...new Set(categories?.map((item) => item.category) || []),
    ];
    return uniqueCategories.sort();
  }
}

export const serviceService = new ServiceService();
