'use client';

import {
  Template,
  TemplateLibrary,
  TemplateSearchFilters,
  TemplateSearchResult,
  TemplateCustomization,
  TemplateInstance,
  TemplateQualityStandards,
  TemplatePerformanceMetrics,
  TemplateTrainingMaterial,
  TemplateApiResponse,
  TemplateApiRequest,
  TemplateType,
  DisputeCategory,
  TemplateStatus
} from '@/types/templates.types';

const API_BASE = '/api/templates';

class TemplatesService {
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TemplateApiResponse<T>> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private getCacheKey(key: string, params?: any): string {
    return params ? `${key}_${JSON.stringify(params)}` : key;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async getTemplates(): Promise<Template[]> {
    const cacheKey = this.getCacheKey('templates');
    const cached = this.getFromCache<Template[]>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<Template[]>('/');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch templates');
    }

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getTemplate(id: string): Promise<Template> {
    const cacheKey = this.getCacheKey('template', { id });
    const cached = this.getFromCache<Template>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<Template>(`/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch template');
    }

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async createTemplate(
    template: Omit<Template, 'id' | 'metadata' | 'versions'>
  ): Promise<Template> {
    const templateData = {
      ...template,
      metadata: {
        author: 'current_user', // Should be replaced with actual user
        lastModified: new Date(),
        usageCount: 0,
        successRate: 0,
        averageResolutionTime: 0,
        industry: [],
        complexity: 'simple' as const,
        language: 'en',
      },
      versions: [
        {
          id: `v1_${Date.now()}`,
          version: '1.0.0',
          createdAt: new Date(),
          createdBy: 'current_user',
          changelog: 'Initial template creation',
          isActive: true,
        },
      ],
      currentVersion: '1.0.0',
    };

    const response = await this.makeRequest<Template>('/', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create template');
    }

    // Clear templates cache
    this.cache.delete(this.getCacheKey('templates'));
    this.cache.delete(this.getCacheKey('library'));

    return response.data;
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    const updateData = {
      ...updates,
      metadata: {
        ...updates.metadata,
        lastModified: new Date(),
      },
    };

    const response = await this.makeRequest<Template>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update template');
    }

    // Clear relevant caches
    this.cache.delete(this.getCacheKey('template', { id }));
    this.cache.delete(this.getCacheKey('templates'));
    this.cache.delete(this.getCacheKey('library'));

    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await this.makeRequest<void>(`/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete template');
    }

    // Clear relevant caches
    this.cache.delete(this.getCacheKey('template', { id }));
    this.cache.delete(this.getCacheKey('templates'));
    this.cache.delete(this.getCacheKey('library'));
  }

  async searchTemplates(filters: TemplateSearchFilters): Promise<TemplateSearchResult> {
    const cacheKey = this.getCacheKey('search', filters);
    const cached = this.getFromCache<TemplateSearchResult>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<TemplateSearchResult>('/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to search templates');
    }

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getLibrary(): Promise<TemplateLibrary> {
    const cacheKey = this.getCacheKey('library');
    const cached = this.getFromCache<TemplateLibrary>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<TemplateLibrary>('/library');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch template library');
    }

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async customizeTemplate(customization: TemplateCustomization): Promise<TemplateInstance> {
    const response = await this.makeRequest<TemplateInstance>('/customize', {
      method: 'POST',
      body: JSON.stringify(customization),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to customize template');
    }

    return response.data;
  }

  async getTemplateInstance(id: string): Promise<TemplateInstance> {
    const response = await this.makeRequest<TemplateInstance>(`/instances/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch template instance');
    }

    return response.data;
  }

  async updateTemplateInstance(
    id: string,
    updates: Partial<TemplateInstance>
  ): Promise<TemplateInstance> {
    const response = await this.makeRequest<TemplateInstance>(`/instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update template instance');
    }

    return response.data;
  }

  async assessQuality(templateId: string): Promise<TemplateQualityStandards> {
    const cacheKey = this.getCacheKey('quality', { templateId });
    const cached = this.getFromCache<TemplateQualityStandards>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<TemplateQualityStandards>(`/${templateId}/quality`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to assess template quality');
    }

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getPerformanceMetrics(templateId: string): Promise<TemplatePerformanceMetrics> {
    const cacheKey = this.getCacheKey('metrics', { templateId });
    const cached = this.getFromCache<TemplatePerformanceMetrics>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<TemplatePerformanceMetrics>(`/${templateId}/metrics`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch performance metrics');
    }

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getTrainingMaterials(templateId: string): Promise<TemplateTrainingMaterial[]> {
    const cacheKey = this.getCacheKey('training', { templateId });
    const cached = this.getFromCache<TemplateTrainingMaterial[]>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<TemplateTrainingMaterial[]>(`/${templateId}/training`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch training materials');
    }

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async duplicateTemplate(templateId: string, newName: string): Promise<Template> {
    const response = await this.makeRequest<Template>(`/${templateId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to duplicate template');
    }

    // Clear templates cache
    this.cache.delete(this.getCacheKey('templates'));
    this.cache.delete(this.getCacheKey('library'));

    return response.data;
  }

  async exportTemplate(
    templateId: string,
    format: 'json' | 'pdf' | 'docx'
  ): Promise<Blob> {
    const response = await fetch(`${API_BASE}/${templateId}/export?format=${format}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to export template');
    }

    return response.blob();
  }

  async importTemplate(file: File): Promise<Template> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to import template');
    }

    const result: TemplateApiResponse<Template> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to import template');
    }

    // Clear templates cache
    this.cache.delete(this.getCacheKey('templates'));
    this.cache.delete(this.getCacheKey('library'));

    return result.data;
  }

  async getTemplatesByType(type: TemplateType): Promise<Template[]> {
    const templates = await this.getTemplates();
    return templates.filter(template => template.type === type);
  }

  async getTemplatesByCategory(category: DisputeCategory): Promise<Template[]> {
    const templates = await this.getTemplates();
    return templates.filter(template => template.category === category);
  }

  async getTemplatesByStatus(status: TemplateStatus): Promise<Template[]> {
    const templates = await this.getTemplates();
    return templates.filter(template => template.status === status);
  }

  async getDefaultTemplates(): Promise<Template[]> {
    const templates = await this.getTemplates();
    return templates.filter(template => template.isDefault);
  }

  async getMobileOptimizedTemplates(): Promise<Template[]> {
    const templates = await this.getTemplates();
    return templates.filter(template => template.mobileOptimized);
  }

  async getCustomizableTemplates(): Promise<Template[]> {
    const templates = await this.getTemplates();
    return templates.filter(template => template.customizable);
  }

  async getTemplateUsageStats(templateId: string): Promise<{
    totalUsage: number;
    successRate: number;
    averageRating: number;
    lastUsed: Date;
  }> {
    const response = await this.makeRequest<{
      totalUsage: number;
      successRate: number;
      averageRating: number;
      lastUsed: Date;
    }>(`/${templateId}/stats`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch template usage stats');
    }

    return response.data;
  }

  async validateTemplate(template: Partial<Template>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await this.makeRequest<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>('/validate', {
      method: 'POST',
      body: JSON.stringify(template),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to validate template');
    }

    return response.data;
  }

  async previewTemplate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<string> {
    const response = await this.makeRequest<{ content: string }>(`/${templateId}/preview`, {
      method: 'POST',
      body: JSON.stringify({ variables }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to preview template');
    }

    return response.data.content;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheByKey(key: string): void {
    // Clear all cache entries that match the key pattern
    for (const cacheKey of this.cache.keys()) {
      if (cacheKey.includes(key)) {
        this.cache.delete(cacheKey);
      }
    }
  }
}

export const templatesService = new TemplatesService();
export default templatesService;