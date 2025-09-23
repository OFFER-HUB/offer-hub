// basic types for fee stuff
export type UserTier = 'basic' | 'premium' | 'enterprise' | 'vip';
export type ProjectType = 'fixed' | 'hourly' | 'milestone' | 'subscription';
export type FeeType = 'platform_fee' | 'service_fee' | 'processing_fee';
export type CommissionType = 'referral' | 'partner' | 'affiliate';
export type FeeStatus = 'pending' | 'applied' | 'refunded';

export interface FeeStructure {
  id: string;
  name: string;
  isActive: boolean;
  userTiers: UserTier[];
  rules: FeeRule[];
  createdAt: string;
  // TODO: add description and expiry date when needed
}

export interface FeeRule {
  id: string;
  type: FeeType;
  calculationMethod: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
}

export interface FeeCalculationInput {
  projectValue: number;
  projectType: ProjectType;
  userTier: UserTier;
  userId: string;
  projectId: string;
  currency: string;
}

export interface FeeCalculationResult {
  input: FeeCalculationInput;
  totalAmount: number;
  netAmount: number;
  fees: CalculatedFee[];
  commissions: CalculatedCommission[];
  breakdown: FeeBreakdown;
  calculatedAt: string;
}

export interface CalculatedFee {
  id: string;
  type: FeeType;
  name: string;
  description: string;
  amount: number;
  percentage?: number;
  rule: FeeRule;
  applied: boolean;
}

export interface CalculatedCommission {
  id: string;
  type: CommissionType;
  recipient: CommissionRecipient;
  amount: number;
  percentage: number;
  description: string;
  status: FeeStatus;
  dueDate: string;
}

export interface CommissionRecipient {
  id: string;
  name: string;
  type: 'user' | 'partner' | 'affiliate';
  accountDetails: {
    paypalEmail?: string;
    bankAccount?: string;
  };
  paymentPreferences: {
    method: 'bank_transfer' | 'paypal';
    currency: string;
    frequency: 'weekly' | 'monthly';
    minimumAmount: number;
  };
}

export interface FeeBreakdown {
  grossAmount: number;
  platformFees: number;
  serviceFees: number;
  processingFees: number;
  netAmount: number;
  feePercentage: number;
}

export interface FeeTransaction {
  id: string;
  projectId: string;
  userId: string;
  calculation: FeeCalculationResult;
  status: FeeStatus;
  processedAt?: string;
}

export interface FeeAnalytics {
  period: {
    start: string;
    end: string;
  };
  totalRevenue: number;
  totalFees: number;
  totalCommissions: number;
  feesByType: Record<FeeType, number>;
  commissionsByType: Record<CommissionType, number>;
  revenueByUserTier: Record<UserTier, number>;
  revenueByProjectType: Record<ProjectType, number>;
  averageFeePercentage: number;
  transactionCount: number;
  refundRate: number;
  disputeRate: number;
  trends: AnalyticsTrend[];
}

export interface AnalyticsTrend {
  date: string;
  revenue: number;
  fees: number;
  commissions: number;
  transactionCount: number;
}

// hook return type
export interface UseFeeManagementReturn {
  feeStructures: FeeStructure[];
  calculations: FeeCalculationResult[];
  transactions: FeeTransaction[];
  analytics: FeeAnalytics | null;
  isLoading: boolean;
  error: string | null;

  // main functions
  calculateFees: (input: FeeCalculationInput) => Promise<FeeCalculationResult>;
  applyFees: (calculationId: string) => Promise<void>;
  createFeeStructure: (structure: any) => Promise<FeeStructure>;
  updateFeeStructure: (id: string, updates: any) => Promise<FeeStructure>;
  deleteFeeStructure: (id: string) => Promise<void>;
  processCommissions: (transactionId: string) => Promise<void>;
  generateReport: (filters: any) => Promise<any>;
  getAnalytics: (period: { start: string; end: string }) => Promise<FeeAnalytics>;
  updateSettings: (settings: any) => Promise<void>;
  refundFees: (transactionId: string, reason: string) => Promise<void>;
  disputeFees: (transactionId: string, reason: string) => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
}

// component props
export interface FeeManagerProps {
  userId?: string;
  projectId?: string;
  className?: string;
  onFeeCalculated?: (result: any) => void;
  onFeeApplied?: (transaction: any) => void;
}

export interface FeeCalculatorProps {
  input: FeeCalculationInput;
  onCalculate?: (result: FeeCalculationResult) => void;
  showBreakdown?: boolean;
  showAdvanced?: boolean;
  className?: string;
}

export interface CommissionDistributionProps {
  commissions: CalculatedCommission[];
  onDistribute?: (commissionIds: string[]) => void;
  onRecipientUpdate?: (recipientId: string, updates: any) => void; // using any for now
  className?: string;
}

export interface FeeAnalyticsProps {
  analytics: FeeAnalytics;
  onPeriodChange?: (period: { start: string; end: string }) => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  className?: string;
}

// basic error class
export class FeeCalculationError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'FeeCalculationError';
    this.code = code;
  }
}