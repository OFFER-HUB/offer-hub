// Mediation System Types
// Comprehensive types for the mediation system including mediators, mediation sessions, and settlement agreements

export interface Mediator {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  expertiseAreas: MediatorExpertise[];
  languages: string[];
  availability: MediatorAvailability;
  rating: number;
  totalMediations: number;
  successfulMediations: number;
  averageResolutionTime: number; // in hours
  hourlyRate?: number;
  currency: string;
  isActive: boolean;
  isVerified: boolean;
  verificationDocuments: VerificationDocument[];
  specializations: string[];
  certifications: MediatorCertification[];
  experience: MediatorExperience[];
  preferences: MediatorPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediatorExpertise {
  id: string;
  category: MediationCategory;
  subcategories: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  yearsOfExperience: number;
  caseCount: number;
  successRate: number;
}

export interface MediatorAvailability {
  timezone: string;
  workingHours: WorkingHours[];
  unavailableDates: DateRange[];
  maxConcurrentMediations: number;
  responseTime: number; // in hours
  preferredMeetingTypes: MeetingType[];
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface VerificationDocument {
  id: string;
  type: 'license' | 'certification' | 'identity' | 'background_check';
  name: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface MediatorCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId: string;
  verificationUrl?: string;
}

export interface MediatorExperience {
  id: string;
  organization: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  isCurrent: boolean;
}

export interface MediatorPreferences {
  preferredDisputeTypes: MediationCategory[];
  preferredDisputeSizes: DisputeSize[];
  maxDisputeAmount: number;
  minDisputeAmount: number;
  preferredCommunicationMethods: CommunicationMethod[];
  autoAcceptAssignments: boolean;
  notificationPreferences: Record<string, any>;
}

export interface MediationSession {
  id: string;
  disputeId: string;
  mediatorId: string;
  status: MediationStatus;
  type: MediationType;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // in minutes
  location?: string;
  meetingType: MeetingType;
  meetingUrl?: string;
  participants: MediationParticipant[];
  agenda: MediationAgendaItem[];
  notes: MediationNote[];
  evidence: MediationEvidence[];
  proposals: MediationProposal[];
  outcome?: MediationOutcome;
  followUpRequired: boolean;
  followUpDate?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediationParticipant {
  id: string;
  userId: string;
  role: 'client' | 'freelancer' | 'mediator' | 'observer';
  name: string;
  email: string;
  isPresent: boolean;
  joinedAt?: Date;
  leftAt?: Date;
  permissions: ParticipantPermissions;
}

export interface ParticipantPermissions {
  canSpeak: boolean;
  canSubmitEvidence: boolean;
  canViewEvidence: boolean;
  canProposeSettlement: boolean;
  canVoteOnProposals: boolean;
  canAccessRecording: boolean;
}

export interface MediationAgendaItem {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface MediationNote {
  id: string;
  sessionId: string;
  authorId: string;
  content: string;
  isPrivate: boolean;
  category: 'general' | 'evidence' | 'proposal' | 'outcome' | 'action_item';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MediationEvidence {
  id: string;
  sessionId: string;
  submittedBy: string;
  title: string;
  description: string;
  type: EvidenceType;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  isAccepted: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  rating?: number; // 1-5 rating for evidence quality
  categories?: string[]; // Evidence categorization tags
  recommendations?: string[]; // Recommendations for evidence usage
  submittedAt: Date;
}

export interface MediationProposal {
  id: string;
  sessionId: string;
  proposedBy: string;
  title: string;
  description: string;
  terms: SettlementTerms;
  status: ProposalStatus;
  votes: ProposalVote[];
  deadline: Date;
  isAccepted: boolean;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettlementTerms {
  financialSettlement: FinancialSettlement;
  nonFinancialTerms: NonFinancialTerm[];
  implementationTimeline: ImplementationTimeline;
  enforcementMechanisms: EnforcementMechanism[];
  confidentialityClause?: string;
  nonDisclosureClause?: string;
  disputeResolutionClause?: string;
}

export interface FinancialSettlement {
  totalAmount: number;
  currency: string;
  paymentSchedule: PaymentSchedule[];
  refundAmount?: number;
  penaltyAmount?: number;
  feeAllocation: FeeAllocation;
}

export interface PaymentSchedule {
  amount: number;
  dueDate: Date;
  recipient: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
}

export interface FeeAllocation {
  platformFee: number;
  mediatorFee: number;
  clientAmount: number;
  freelancerAmount: number;
}

export interface NonFinancialTerm {
  id: string;
  type: 'apology' | 'work_revision' | 'future_work' | 'reference' | 'other';
  description: string;
  deadline?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  verifiedBy?: string;
}

export interface ImplementationTimeline {
  startDate: Date;
  endDate: Date;
  milestones: TimelineMilestone[];
  isFlexible: boolean;
}

export interface TimelineMilestone {
  id: string;
  description: string;
  dueDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  dependencies: string[];
}

export interface EnforcementMechanism {
  id: string;
  type: 'escrow_hold' | 'performance_bond' | 'penalty_clause' | 'arbitration' | 'other';
  description: string;
  amount?: number;
  conditions: string[];
}

export interface ProposalVote {
  id: string;
  participantId: string;
  vote: 'accept' | 'reject' | 'abstain';
  comments?: string;
  votedAt: Date;
}

export interface SettlementAgreement {
  id: string;
  mediationSessionId: string;
  disputeId: string;
  title: string;
  description: string;
  terms: SettlementTerms;
  status: AgreementStatus;
  version: number;
  isActive: boolean;
  signedBy: AgreementSignature[];
  effectiveDate: Date;
  expiryDate?: Date;
  templateId?: string;
  customClauses: CustomClause[];
  attachments: AgreementAttachment[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgreementSignature {
  id: string;
  signatoryId: string;
  signatoryName: string;
  signatoryRole: 'client' | 'freelancer' | 'mediator' | 'witness';
  signatureType: 'digital' | 'electronic' | 'wet_signature';
  signatureData: string; // Base64 encoded signature or hash
  signedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isVerified: boolean;
  verificationMethod?: string;
}

export interface CustomClause {
  id: string;
  title: string;
  content: string;
  order: number;
  isRequired: boolean;
  addedBy: string;
  addedAt: Date;
}

export interface AgreementAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  isRequired: boolean;
}

export interface MediationAssignment {
  id: string;
  disputeId: string;
  mediatorId: string;
  assignmentType: 'automatic' | 'manual' | 'self_selected';
  assignedBy?: string;
  assignedAt: Date;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  estimatedDuration: number; // in hours
  actualDuration?: number; // in hours
  reason?: string;
  notes?: string;
  acceptedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  metadata: Record<string, any>;
}

export interface MediationAnalytics {
  totalMediations: number;
  successfulMediations: number;
  averageResolutionTime: number; // in hours
  successRate: number;
  mediatorPerformance: MediatorPerformance[];
  categoryBreakdown: CategoryBreakdown[];
  timeToResolution: TimeToResolutionStats;
  satisfactionScores: SatisfactionScores;
  costAnalysis: CostAnalysis;
  trends: MediationTrends;
}

export interface MediatorPerformance {
  mediatorId: string;
  mediatorName: string;
  totalMediations: number;
  successfulMediations: number;
  successRate: number;
  averageResolutionTime: number;
  averageRating: number;
  totalEarnings: number;
  specialties: string[];
}

export interface CategoryBreakdown {
  category: MediationCategory;
  count: number;
  successRate: number;
  averageResolutionTime: number;
  averageAmount: number;
}

export interface TimeToResolutionStats {
  average: number;
  median: number;
  p95: number;
  p99: number;
  byCategory: Record<MediationCategory, number>;
  byMediator: Record<string, number>;
}

export interface SatisfactionScores {
  overall: number;
  byParticipant: {
    clients: number;
    freelancers: number;
  };
  byCategory: Record<MediationCategory, number>;
  byMediator: Record<string, number>;
}

export interface CostAnalysis {
  totalPlatformCosts: number;
  totalMediatorCosts: number;
  averageCostPerMediation: number;
  costSavings: number;
  roi: number;
}

export interface MediationTrends {
  monthlyGrowth: number;
  categoryTrends: Record<MediationCategory, number>;
  resolutionTimeTrends: number[];
  satisfactionTrends: number[];
  costTrends: number[];
}

export interface MediationNotification {
  id: string;
  userId: string;
  type: MediationNotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

export interface MediationEscalation {
  id: string;
  mediationSessionId: string;
  disputeId: string;
  fromStage: string;
  toStage: string;
  reason: EscalationReason;
  escalatedBy: string;
  escalatedAt: Date;
  status: EscalationStatus;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata: Record<string, any>;
}

// Enums and Union Types
export type MediationCategory = 
  | 'contract_dispute'
  | 'payment_dispute'
  | 'quality_dispute'
  | 'scope_dispute'
  | 'timeline_dispute'
  | 'communication_dispute'
  | 'intellectual_property'
  | 'confidentiality'
  | 'other';

export type MediationStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'escalated'
  | 'failed';

export type MediationType = 
  | 'individual'
  | 'group'
  | 'shuttle'
  | 'caucus'
  | 'hybrid';

export type MeetingType = 
  | 'in_person'
  | 'video_call'
  | 'phone_call'
  | 'chat'
  | 'hybrid';

export type EvidenceType = 
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'screenshot'
  | 'email'
  | 'message'
  | 'contract'
  | 'invoice'
  | 'other';

export type ProposalStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'voting'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'withdrawn';

export type AgreementStatus = 
  | 'draft'
  | 'pending_signatures'
  | 'signed'
  | 'active'
  | 'completed'
  | 'breached'
  | 'terminated'
  | 'expired';

export type AssignmentStatus = 
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type AssignmentPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export type CommunicationMethod = 
  | 'email'
  | 'phone'
  | 'video_call'
  | 'in_person'
  | 'chat'
  | 'sms';

export type DisputeSize = 
  | 'small'
  | 'medium'
  | 'large'
  | 'enterprise';

export type MediationNotificationType = 
  | 'session_scheduled'
  | 'session_starting'
  | 'session_ended'
  | 'proposal_submitted'
  | 'proposal_voted'
  | 'agreement_ready'
  | 'agreement_signed'
  | 'evidence_submitted'
  | 'deadline_approaching'
  | 'deadline_expired'
  | 'escalation_required'
  | 'assignment_received'
  | 'assignment_accepted'
  | 'assignment_declined';

export type EscalationReason = 
  | 'mediation_failed'
  | 'deadline_expired'
  | 'participant_unresponsive'
  | 'complex_issues'
  | 'legal_requirements'
  | 'participant_request'
  | 'mediator_recommendation'
  | 'other';

export type EscalationStatus = 
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'cancelled';

export type MediationOutcome = 
  | 'settled'
  | 'partially_settled'
  | 'not_settled'
  | 'escalated'
  | 'cancelled';

// DTOs for API requests/responses
export interface CreateMediatorDTO {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  expertiseAreas: Omit<MediatorExpertise, 'id' | 'caseCount' | 'successRate'>[];
  languages: string[];
  availability: Omit<MediatorAvailability, 'timezone'>;
  hourlyRate?: number;
  currency: string;
  specializations: string[];
  certifications: Omit<MediatorCertification, 'id'>[];
  experience: Omit<MediatorExperience, 'id'>[];
  preferences: Omit<MediatorPreferences, 'notificationPreferences'>;
}

export interface UpdateMediatorDTO {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  expertiseAreas?: MediatorExpertise[];
  languages?: string[];
  availability?: MediatorAvailability;
  hourlyRate?: number;
  currency?: string;
  specializations?: string[];
  isActive?: boolean;
  preferences?: MediatorPreferences;
}

export interface CreateMediationSessionDTO {
  disputeId: string;
  mediatorId: string;
  type: MediationType;
  scheduledAt?: Date;
  meetingType: MeetingType;
  location?: string;
  agenda: Omit<MediationAgendaItem, 'id' | 'status' | 'startedAt' | 'completedAt'>[];
  participants: Omit<MediationParticipant, 'id' | 'isPresent' | 'joinedAt' | 'leftAt'>[];
}

export interface UpdateMediationSessionDTO {
  status?: MediationStatus;
  scheduledAt?: Date;
  location?: string;
  meetingType?: MeetingType;
  meetingUrl?: string;
  agenda?: MediationAgendaItem[];
  metadata?: Record<string, any>;
}

export interface CreateSettlementAgreementDTO {
  mediationSessionId: string;
  disputeId: string;
  title: string;
  description: string;
  terms: SettlementTerms;
  templateId?: string;
  customClauses?: Omit<CustomClause, 'id' | 'addedBy' | 'addedAt'>[];
  attachments?: Omit<AgreementAttachment, 'id' | 'uploadedBy' | 'uploadedAt'>[];
}

export interface SignAgreementDTO {
  agreementId: string;
  signatureType: 'digital' | 'electronic' | 'wet_signature';
  signatureData: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface MediationFilters {
  status?: MediationStatus[];
  category?: MediationCategory[];
  mediatorId?: string;
  disputeId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isActive?: boolean;
  search?: string;
}

export interface MediatorFilters {
  expertiseAreas?: MediationCategory[];
  languages?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  rating?: number;
  availability?: boolean;
  search?: string;
  location?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MediationListResponse {
  mediations: MediationSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MediatorListResponse {
  mediators: Mediator[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: Date;
}

export interface MediationApiResponse<T> extends ApiResponse<T> {
  mediationId?: string;
  sessionId?: string;
  mediatorId?: string;
}
