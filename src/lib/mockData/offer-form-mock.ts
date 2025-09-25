export interface OfferFormData {
  // Step 1: Offer Details
  offerTitle: string;
  projectDescription: string;
  deliverables: string[];
  specialRequirements: string;
  
  // Step 2: Project Duration
  projectDuration?: 'long' | 'short';
  
  // Budget & Terms (moved to later steps if needed)
  budgetType: 'fixed' | 'hourly';
  budgetAmount: number;
  hourlyRate?: number;
  estimatedHours?: number;
  paymentMilestones: PaymentMilestone[];
  terms: string;
  
  // Step 3: Timeline
  startDate: string;
  deadline: string;
  estimatedDuration: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface PaymentMilestone {
  id: string;
  title: string;
  percentage: number;
  amount: number;
  description: string;
}

export interface OfferTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  defaultData: Partial<OfferFormData>;
}

// Default offer form data
export const defaultOfferFormData: OfferFormData = {
  offerTitle: '',
  projectDescription: '',
  deliverables: [],
  specialRequirements: '',
  budgetType: 'fixed',
  budgetAmount: 0,
  paymentMilestones: [],
  terms: '',
  startDate: '',
  deadline: '',
  estimatedDuration: '',
  urgency: 'medium'
};

// Default payment milestones templates
export const defaultMilestones: PaymentMilestone[] = [
  {
    id: '1',
    title: 'Project Start',
    percentage: 30,
    amount: 0,
    description: 'Initial payment upon project start'
  },
  {
    id: '2', 
    title: 'Midpoint Review',
    percentage: 40,
    amount: 0,
    description: 'Payment after midpoint deliverables review'
  },
  {
    id: '3',
    title: 'Project Completion',
    percentage: 30,
    amount: 0,
    description: 'Final payment upon project completion'
  }
];

// Offer templates for different project types
export const offerTemplates: OfferTemplate[] = [
  {
    id: 'web-dev',
    title: 'Web Development Project',
    description: 'Template for web development offers',
    category: 'Development',
    defaultData: {
      deliverables: [
        'Responsive website design',
        'Frontend implementation',
        'Backend API development',
        'Database setup',
        'Testing and deployment'
      ],
      terms: '- All code will be delivered with proper documentation\n- 2 rounds of revisions included\n- 30-day bug fix warranty\n- Source code ownership transfers upon final payment'
    }
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design Project', 
    description: 'Template for design offers',
    category: 'Design',
    defaultData: {
      deliverables: [
        'User research and analysis',
        'Wireframes and user flows',
        'High-fidelity mockups',
        'Interactive prototypes',
        'Design system documentation'
      ],
      terms: '- All designs delivered in Figma/Adobe format\n- 3 rounds of revisions included\n- Style guide and assets provided\n- Commercial usage rights included'
    }
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Development',
    description: 'Template for mobile app offers', 
    category: 'Development',
    defaultData: {
      deliverables: [
        'Cross-platform mobile app',
        'User authentication system',
        'Core feature implementation',
        'App store deployment',
        'User documentation'
      ],
      terms: '- iOS and Android compatibility\n- App store submission assistance\n- 60-day post-launch support\n- Source code and documentation included'
    }
  }
];

// Budget range suggestions based on project type
export const budgetRanges = {
  'web-dev': {
    min: 2000,
    max: 15000,
    suggested: [3000, 5000, 8000, 12000]
  },
  'ui-ux': {
    min: 1500,
    max: 8000,
    suggested: [2000, 3500, 5000, 7000]
  },
  'mobile-app': {
    min: 5000,
    max: 25000,
    suggested: [8000, 12000, 18000, 22000]
  },
  general: {
    min: 500,
    max: 50000,
    suggested: [1000, 2500, 5000, 10000]
  }
};

// Timeline suggestions
export const timelineSuggestions = [
  { label: '1 week', value: '1 week', days: 7 },
  { label: '2 weeks', value: '2 weeks', days: 14 },
  { label: '1 month', value: '1 month', days: 30 },
  { label: '2 months', value: '2 months', days: 60 },
  { label: '3 months', value: '3 months', days: 90 },
  { label: '6 months', value: '6 months', days: 180 },
  { label: 'Custom', value: 'custom', days: 0 }
];

// Urgency levels with descriptions
export const urgencyLevels = [
  {
    value: 'low' as const,
    label: 'Low Priority',
    description: 'Standard timeline, flexible deadlines',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    value: 'medium' as const,
    label: 'Medium Priority', 
    description: 'Moderate timeline, some flexibility',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    value: 'high' as const,
    label: 'High Priority',
    description: 'Tight timeline, urgent delivery needed',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
];

// Mock offer sent data
export const generateMockOfferId = (): string => {
  return `OFF-${Date.now().toString().slice(-6).padStart(6, '0')}`;
};

export const getMockOfferSentData = (freelancerName: string) => {
  const offerId = generateMockOfferId();
  const sentAt = new Date().toISOString();
  
  return {
    offerId,
    status: 'sent',
    sentAt,
    freelancerName,
    estimatedResponse: '24-48 hours',
    trackingUrl: `/dashboard/offers/${offerId}`,
    message: `Your offer has been successfully sent to ${freelancerName}. They will be notified via email and can respond directly through the platform.`
  };
};