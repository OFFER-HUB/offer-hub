'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
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
  UseTemplateManagementReturn,
  TemplateType,
  DisputeCategory
} from '@/types/templates.types';
import templatesService from '@/services/templates.service';

export const useResolutionTemplates = (): UseTemplateManagementReturn => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [library, setLibrary] = useState<TemplateLibrary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<TemplateSearchResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleError = useCallback((error: any, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
    toast.error(errorMessage);
    console.error(defaultMessage, error);
  }, []);

  const getTemplates = useCallback(async (): Promise<Template[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const templatesData = await templatesService.getTemplates();
      setTemplates(templatesData);
      return templatesData;
    } catch (error) {
      handleError(error, 'Failed to fetch templates');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getTemplate = useCallback(async (id: string): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      const template = await templatesService.getTemplate(id);
      setSelectedTemplate(template);
      return template;
    } catch (error) {
      handleError(error, 'Failed to fetch template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const createTemplate = useCallback(async (
    template: Omit<Template, 'id' | 'metadata' | 'versions'>
  ): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      const newTemplate = await templatesService.createTemplate(template);
      setTemplates(prev => [...prev, newTemplate]);
      toast.success('Template created successfully');
      return newTemplate;
    } catch (error) {
      handleError(error, 'Failed to create template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const updateTemplate = useCallback(async (
    id: string,
    updates: Partial<Template>
  ): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedTemplate = await templatesService.updateTemplate(id, updates);
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(updatedTemplate);
      }
      toast.success('Template updated successfully');
      return updatedTemplate;
    } catch (error) {
      handleError(error, 'Failed to update template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, selectedTemplate]);

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await templatesService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
      toast.success('Template deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, selectedTemplate]);

  const searchTemplates = useCallback(async (
    filters: TemplateSearchFilters
  ): Promise<TemplateSearchResult> => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await templatesService.searchTemplates(filters);
      setSearchResults(results);
      return results;
    } catch (error) {
      handleError(error, 'Failed to search templates');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getLibrary = useCallback(async (): Promise<TemplateLibrary> => {
    try {
      setIsLoading(true);
      setError(null);
      const libraryData = await templatesService.getLibrary();
      setLibrary(libraryData);
      return libraryData;
    } catch (error) {
      handleError(error, 'Failed to fetch template library');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const customizeTemplate = useCallback(async (
    customization: TemplateCustomization
  ): Promise<TemplateInstance> => {
    try {
      setIsLoading(true);
      setError(null);
      const instance = await templatesService.customizeTemplate(customization);
      toast.success('Template customized successfully');
      return instance;
    } catch (error) {
      handleError(error, 'Failed to customize template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const assessQuality = useCallback(async (
    templateId: string
  ): Promise<TemplateQualityStandards> => {
    try {
      setIsLoading(true);
      setError(null);
      const quality = await templatesService.assessQuality(templateId);
      return quality;
    } catch (error) {
      handleError(error, 'Failed to assess template quality');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getPerformanceMetrics = useCallback(async (
    templateId: string
  ): Promise<TemplatePerformanceMetrics> => {
    try {
      setIsLoading(true);
      setError(null);
      const metrics = await templatesService.getPerformanceMetrics(templateId);
      return metrics;
    } catch (error) {
      handleError(error, 'Failed to fetch performance metrics');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getTrainingMaterials = useCallback(async (
    templateId: string
  ): Promise<TemplateTrainingMaterial[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const materials = await templatesService.getTrainingMaterials(templateId);
      return materials;
    } catch (error) {
      handleError(error, 'Failed to fetch training materials');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const duplicateTemplate = useCallback(async (
    templateId: string,
    newName: string
  ): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      const duplicated = await templatesService.duplicateTemplate(templateId, newName);
      setTemplates(prev => [...prev, duplicated]);
      toast.success('Template duplicated successfully');
      return duplicated;
    } catch (error) {
      handleError(error, 'Failed to duplicate template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const exportTemplate = useCallback(async (
    templateId: string,
    format: 'json' | 'pdf' | 'docx'
  ): Promise<Blob> => {
    try {
      setIsLoading(true);
      setError(null);
      const blob = await templatesService.exportTemplate(templateId, format);
      toast.success(`Template exported as ${format.toUpperCase()}`);
      return blob;
    } catch (error) {
      handleError(error, 'Failed to export template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const importTemplate = useCallback(async (file: File): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      const imported = await templatesService.importTemplate(file);
      setTemplates(prev => [...prev, imported]);
      toast.success('Template imported successfully');
      return imported;
    } catch (error) {
      handleError(error, 'Failed to import template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Initialize templates on mount
  useEffect(() => {
    getTemplates().catch(console.error);
  }, [getTemplates]);

  return {
    templates,
    library,
    isLoading,
    error,
    searchResults,
    selectedTemplate,
    actions: {
      getTemplates,
      getTemplate,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      searchTemplates,
      getLibrary,
      customizeTemplate,
      assessQuality,
      getPerformanceMetrics,
      getTrainingMaterials,
      duplicateTemplate,
      exportTemplate,
      importTemplate,
    },
  };
};

// Additional specialized hooks
export const useTemplatesByType = (type: TemplateType) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const typeTemplates = await templatesService.getTemplatesByType(type);
        setTemplates(typeTemplates);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [type]);

  return { templates, isLoading, error };
};

export const useTemplatesByCategory = (category: DisputeCategory) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const categoryTemplates = await templatesService.getTemplatesByCategory(category);
        setTemplates(categoryTemplates);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [category]);

  return { templates, isLoading, error };
};

export const useDefaultTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const defaultTemplates = await templatesService.getDefaultTemplates();
        setTemplates(defaultTemplates);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch default templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, isLoading, error };
};

export const useTemplateQuality = (templateId: string) => {
  const [quality, setQuality] = useState<TemplateQualityStandards | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assessQuality = useCallback(async () => {
    if (!templateId) return;

    try {
      setIsLoading(true);
      setError(null);
      const qualityStandards = await templatesService.assessQuality(templateId);
      setQuality(qualityStandards);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to assess quality');
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    assessQuality();
  }, [assessQuality]);

  return { quality, isLoading, error, reassess: assessQuality };
};

export const useTemplateMetrics = (templateId: string) => {
  const [metrics, setMetrics] = useState<TemplatePerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;

    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const performanceMetrics = await templatesService.getPerformanceMetrics(templateId);
        setMetrics(performanceMetrics);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [templateId]);

  return { metrics, isLoading, error };
};

export const useTemplatePreview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewTemplate = useCallback(async (
    templateId: string,
    variables: Record<string, any>
  ): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await templatesService.previewTemplate(templateId, variables);
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to preview template';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { previewTemplate, isLoading, error };
};

export default useResolutionTemplates;