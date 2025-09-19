export type TemplateType =
  | 'communication'
  | 'evidence_request'
  | 'mediation_proposal'
  | 'resolution_proposal'
  | 'decision_notification'
  | 'escalation_notice'
  | 'closure_notification'
  | 'custom';

export type TemplateStatus = 'active' | 'inactive' | 'draft' | 'archived';

export type TemplatePriority = 'low' | 'medium' | 'high' | 'critical';

export type DisputeCategory =
  | 'payment_dispute'
  | 'quality_dispute'
  | 'scope_dispute'
  | 'deadline_dispute'
  | 'communication_issue'
  | 'contract_breach'
  | 'intellectual_property'
  | 'other';

export interface TemplateVariable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  order: number;
  optional: boolean;
  variables: TemplateVariable[];
}

export interface TemplateVersion {
  id: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  changelog: string;
  isActive: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: DisputeCategory;
  status: TemplateStatus;
  priority: TemplatePriority;
  tags: string[];
  sections: TemplateSection[];
  variables: TemplateVariable[];
  metadata: {
    author: string;
    lastModified: Date;
    usageCount: number;
    successRate: number;
    averageResolutionTime: number;
    industry: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    language: string;
    jurisdiction?: string;
  };
  versions: TemplateVersion[];
  currentVersion: string;
  isDefault: boolean;
  customizable: boolean;
  mobileOptimized: boolean;
  integrationCompatible: string[];
}

export interface TemplateLibrary {
  templates: Template[];
  categories: {
    id: string;
    name: string;
    description: string;
    templateCount: number;
  }[];
  tags: {
    name: string;
    count: number;
  }[];
  totalTemplates: number;
  lastUpdated: Date;
}

export interface TemplateSearchFilters {
  type?: TemplateType[];
  category?: DisputeCategory[];
  status?: TemplateStatus[];
  priority?: TemplatePriority[];
  tags?: string[];
  author?: string;
  language?: string;
  mobileOptimized?: boolean;
  customizable?: boolean;
  complexity?: ('simple' | 'moderate' | 'complex')[];
  searchQuery?: string;
  sortBy?: 'name' | 'created' | 'usage' | 'success_rate' | 'last_modified';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateSearchResult {
  templates: Template[];
  totalCount: number;
  filters: TemplateSearchFilters;
  facets: {
    types: { value: TemplateType; count: number }[];
    categories: { value: DisputeCategory; count: number }[];
    tags: { value: string; count: number }[];
    authors: { value: string; count: number }[];
  };
}

export interface TemplateCustomization {
  templateId: string;
  customizations: {
    sectionId: string;
    modifications: {
      content?: string;
      variables?: Record<string, any>;
      optional?: boolean;
    };
  }[];
  previewMode: boolean;
  saveAsDraft: boolean;
}

export interface TemplateInstance {
  id: string;
  templateId: string;
  disputeId: string;
  customizations: TemplateCustomization['customizations'];
  resolvedContent: string;
  createdAt: Date;
  createdBy: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'responded';
  effectivenessRating?: number;
  responseTime?: number;
}

export interface TemplateQualityStandards {
  clarity: {
    score: number;
    criteria: string[];
    recommendations: string[];
  };
  completeness: {
    score: number;
    missingElements: string[];
    suggestions: string[];
  };
  compliance: {
    score: number;
    legalRequirements: string[];
    jurisdictionCompliance: Record<string, boolean>;
  };
  effectiveness: {
    score: number;
    historicalData: {
      usageCount: number;
      successRate: number;
      averageResolutionTime: number;
    };
    benchmarkComparison: string;
  };
  accessibility: {
    score: number;
    mobileCompatibility: boolean;
    languageLevel: string;
    visualElements: boolean;
  };
  overallScore: number;
  lastAssessed: Date;
  assessedBy: string;
}

export interface TemplatePerformanceMetrics {
  templateId: string;
  usage: {
    totalUsage: number;
    monthlyUsage: number[];
    userAdoption: number;
    peakUsageTimes: string[];
  };
  effectiveness: {
    successRate: number;
    averageResolutionTime: number;
    escalationRate: number;
    userSatisfaction: number;
  };
  quality: {
    errorRate: number;
    completionRate: number;
    customizationRate: number;
    feedbackScore: number;
  };
  comparative: {
    industryBenchmark: number;
    similarTemplates: {
      templateId: string;
      performanceComparison: number;
    }[];
  };
}

export interface TemplateTrainingMaterial {
  id: string;
  templateId: string;
  type: 'video' | 'document' | 'interactive' | 'webinar';
  title: string;
  description: string;
  content: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learningObjectives: string[];
  assessments: {
    id: string;
    type: 'quiz' | 'practice' | 'scenario';
    questions: any[];
  }[];
  completionCriteria: string[];
  certification: boolean;
}

export interface TemplateApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    totalCount?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface TemplateApiRequest {
  action: string;
  data?: any;
  filters?: any;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface UseTemplateManagementReturn {
  templates: Template[];
  library: TemplateLibrary | null;
  isLoading: boolean;
  error: string | null;
  searchResults: TemplateSearchResult | null;
  selectedTemplate: Template | null;
  actions: {
    getTemplates: () => Promise<Template[]>;
    getTemplate: (id: string) => Promise<Template>;
    createTemplate: (template: Omit<Template, 'id' | 'metadata' | 'versions'>) => Promise<Template>;
    updateTemplate: (id: string, updates: Partial<Template>) => Promise<Template>;
    deleteTemplate: (id: string) => Promise<void>;
    searchTemplates: (filters: TemplateSearchFilters) => Promise<TemplateSearchResult>;
    getLibrary: () => Promise<TemplateLibrary>;
    customizeTemplate: (customization: TemplateCustomization) => Promise<TemplateInstance>;
    assessQuality: (templateId: string) => Promise<TemplateQualityStandards>;
    getPerformanceMetrics: (templateId: string) => Promise<TemplatePerformanceMetrics>;
    getTrainingMaterials: (templateId: string) => Promise<TemplateTrainingMaterial[]>;
    duplicateTemplate: (templateId: string, newName: string) => Promise<Template>;
    exportTemplate: (templateId: string, format: 'json' | 'pdf' | 'docx') => Promise<Blob>;
    importTemplate: (file: File) => Promise<Template>;
  };
}

export interface TemplateLibraryProps {
  showSearch?: boolean;
  showFilters?: boolean;
  allowCreation?: boolean;
  allowEditing?: boolean;
  selectionMode?: 'single' | 'multiple' | 'none';
  onTemplateSelect?: (template: Template) => void;
  onTemplatesSelect?: (templates: Template[]) => void;
  defaultFilters?: TemplateSearchFilters;
  compactView?: boolean;
  showMetrics?: boolean;
}

export interface TemplateCustomizationProps {
  template: Template;
  disputeId?: string;
  previewMode?: boolean;
  onSave?: (customization: TemplateCustomization) => void;
  onPreview?: (content: string) => void;
  onCancel?: () => void;
  allowVariableEditing?: boolean;
  showPreview?: boolean;
  mobileOptimized?: boolean;
}

export interface TemplateQualityProps {
  templateId: string;
  showDetailedMetrics?: boolean;
  allowReassessment?: boolean;
  showRecommendations?: boolean;
  showComparisons?: boolean;
  onQualityUpdate?: (standards: TemplateQualityStandards) => void;
}

export interface ResolutionTemplatesProps {
  disputeId: string;
  onTemplateSelect?: (template: Template) => void;
  showCustomization?: boolean;
  filterByDisputeType?: boolean;
  allowQuickActions?: boolean;
}