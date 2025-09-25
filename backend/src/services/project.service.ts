import { supabase } from '@/lib/supabase/supabase';
import { CreateProjectDTO } from '@/types/project.type';
import { InternalServerError } from '@/utils/AppError';
export const createProject = async (data: CreateProjectDTO) => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert([data])
    .select()
    .single();

  if (error) throw new InternalServerError(error.message);
  return project;
};

export const getAllProjects = async (filters: any) => {
  let query = supabase.from('projects').select('*');

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.budget_min) query = query.gte('budget', filters.budget_min);
  if (filters.budget_max) query = query.lte('budget', filters.budget_max);

  const { data, error } = await query;

  if (error) throw new InternalServerError(error.message);
  return data;
};

export const getProjectById = async (id: string) => {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, users!projects_client_id_fkey(name)')
    .eq('id', id)
    .single();

  if (error) throw new InternalServerError(error.message);
  return {
    ...project,
    client_name: project.users?.name || null,
  };
};

export const updateProject = async (
  id: string,
  updates: Partial<CreateProjectDTO>,
  client_id: string
) => {
  const { data: existing, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !existing) {
    return { success: false, status: 404, message: 'Project_not_found' };
  }

  if (existing.client_id !== client_id) {
    return { success: false, status: 403, message: 'Unauthorized_client' };
  }

  if (updates.status) {
    const validTransitions: Record<string, string[]> = {
      pending: ['in_progress'],
      in_progress: ['completed'],
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(updates.status)) {
      return {
        success: false,
        status: 400,
        message: 'Invalid_status_transition',
      };
    }
  }

  const allowedFields = ['title', 'description', 'budget', 'status'];
  const cleanUpdates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (updates[key as keyof CreateProjectDTO] !== undefined) {
      cleanUpdates[key] = updates[key as keyof CreateProjectDTO];
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('projects')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return { success: false, status: 500, message: 'Update_failed' };
  }

  return { success: true, status: 200, data: updated };
};

export const deleteProject = async (id: string, client_id: string) => {
  const { data: existing, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !existing) {
    return { success: false, status: 404, message: 'Project_not_found' };
  }

  if (existing.client_id !== client_id) {
    return { success: false, status: 403, message: 'Unauthorized_client' };
  }

  if (existing.status !== 'pending') {
    return {
      success: false,
      status: 400,
      message: 'Cannot_delete_non_pending_project',
    };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from('projects')
    .update({ status: 'deleted' })
    .eq('id', id)
    .select()
    .single();

  if (deleteError) {
    return {
      success: false,
      status: 500,
      message: 'Delete_failed',
    };
  }

  return { success: true, status: 200, message: 'Project_deleted', data: deleted };
};