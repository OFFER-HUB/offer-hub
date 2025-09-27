import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Mediator,
  MediationSession,
  SettlementAgreement,
  MediationAssignment,
  MediationAnalytics,
  MediationNotification,
  MediationEscalation,
  CreateMediatorDTO,
  UpdateMediatorDTO,
  CreateMediationSessionDTO,
  UpdateMediationSessionDTO,
  CreateSettlementAgreementDTO,
  SignAgreementDTO,
  MediationFilters,
  MediatorFilters,
  PaginationParams,
  MediationListResponse,
  MediatorListResponse,
  MediationCategory,
  MediationStatus,
  AssignmentStatus,
  AgreementStatus,
  MediationOutcome,
  EscalationReason,
  EscalationStatus
} from '../types/mediation.types';
import { supabase } from '../lib/supabase/supabase';

// Simple logger using console
const logger = {
  error: (message: string, error?: any) => {
    console.error(`[MEDIATION_ERROR] ${message}`, error);
  },
  info: (message: string, data?: any) => {
    console.log(`[MEDIATION_INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[MEDIATION_WARN] ${message}`, data);
  }
};

export class MediationService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  // Mediator Management
  async createMediator(mediatorData: CreateMediatorDTO): Promise<Mediator> {
    try {
      const { data, error } = await this.supabase
        .from('mediators')
        .insert({
          user_id: mediatorData.userId,
          name: mediatorData.name,
          email: mediatorData.email,
          phone: mediatorData.phone,
          bio: mediatorData.bio,
          expertise_areas: mediatorData.expertiseAreas,
          languages: mediatorData.languages,
          availability: mediatorData.availability,
          hourly_rate: mediatorData.hourlyRate,
          currency: mediatorData.currency,
          specializations: mediatorData.specializations,
          certifications: mediatorData.certifications,
          experience: mediatorData.experience,
          preferences: mediatorData.preferences,
          is_active: true,
          is_verified: false,
          rating: 0,
          total_mediations: 0,
          successful_mediations: 0,
          average_resolution_time: 0,
          verification_documents: []
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Mediator created successfully', { mediatorId: data.id });
      return this.mapMediatorFromDB(data);
    } catch (error) {
      logger.error('Error creating mediator:', error);
      throw error;
    }
  }

  async getMediator(mediatorId: string): Promise<Mediator | null> {
    try {
      const { data, error } = await this.supabase
        .from('mediators')
        .select('*')
        .eq('id', mediatorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapMediatorFromDB(data);
    } catch (error) {
      logger.error('Error getting mediator:', error);
      throw error;
    }
  }

  async getMediatorByUserId(userId: string): Promise<Mediator | null> {
    try {
      const { data, error } = await this.supabase
        .from('mediators')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapMediatorFromDB(data);
    } catch (error) {
      logger.error('Error getting mediator by user ID:', error);
      throw error;
    }
  }

  async updateMediator(mediatorId: string, updates: UpdateMediatorDTO): Promise<Mediator> {
    try {
      const { data, error } = await this.supabase
        .from('mediators')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', mediatorId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Mediator updated successfully', { mediatorId });
      return this.mapMediatorFromDB(data);
    } catch (error) {
      logger.error('Error updating mediator:', error);
      throw error;
    }
  }

  async getMediators(filters: MediatorFilters = {}, pagination: PaginationParams = { page: 1, limit: 10 }): Promise<MediatorListResponse> {
    try {
      let query = this.supabase
        .from('mediators')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.expertiseAreas?.length) {
        query = query.overlaps('expertise_areas', filters.expertiseAreas);
      }
      if (filters.languages?.length) {
        query = query.overlaps('languages', filters.languages);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }
      if (filters.rating) {
        query = query.gte('rating', filters.rating);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,specializations.cs.{${filters.search}}`);
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.range(offset, offset + pagination.limit - 1);

      // Apply sorting
      if (pagination.sortBy) {
        query = query.order(pagination.sortBy, { ascending: pagination.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const mediators = data?.map(mediator => this.mapMediatorFromDB(mediator)) || [];

      return {
        mediators,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pagination.limit)
        }
      };
    } catch (error) {
      logger.error('Error getting mediators:', error);
      throw error;
    }
  }

  async assignMediatorToDispute(disputeId: string, mediatorId: string, assignedBy: string): Promise<MediationAssignment> {
    try {
      const { data, error } = await this.supabase
        .from('mediation_assignments')
        .insert({
          dispute_id: disputeId,
          mediator_id: mediatorId,
          assignment_type: 'manual',
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          status: 'pending',
          priority: 'normal',
          estimated_duration: 4, // Default 4 hours
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to mediator
      await this.sendNotification({
        userId: mediatorId,
        type: 'assignment_received',
        title: 'New Mediation Assignment',
        message: `You have been assigned to mediate dispute ${disputeId}`,
        data: { disputeId, assignmentId: data.id },
        priority: 'high',
        isRead: false
      });

      logger.info('Mediator assigned to dispute', { disputeId, mediatorId });
      return this.mapAssignmentFromDB(data);
    } catch (error) {
      logger.error('Error assigning mediator:', error);
      throw error;
    }
  }

  // Mediation Session Management
  async createMediationSession(sessionData: CreateMediationSessionDTO): Promise<MediationSession> {
    try {
      const { data, error } = await this.supabase
        .from('mediation_sessions')
        .insert({
          dispute_id: sessionData.disputeId,
          mediator_id: sessionData.mediatorId,
          type: sessionData.type,
          scheduled_at: sessionData.scheduledAt?.toISOString(),
          meeting_type: sessionData.meetingType,
          location: sessionData.location,
          status: 'scheduled',
          participants: sessionData.participants,
          agenda: sessionData.agenda,
          notes: [],
          evidence: [],
          proposals: [],
          follow_up_required: false,
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Mediation session created', { sessionId: data.id });
      return this.mapSessionFromDB(data);
    } catch (error) {
      logger.error('Error creating mediation session:', error);
      throw error;
    }
  }

  async getMediationSession(sessionId: string): Promise<MediationSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('mediation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapSessionFromDB(data);
    } catch (error) {
      logger.error('Error getting mediation session:', error);
      throw error;
    }
  }

  async updateMediationSession(sessionId: string, updates: UpdateMediationSessionDTO): Promise<MediationSession> {
    try {
      const { data, error } = await this.supabase
        .from('mediation_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Mediation session updated', { sessionId });
      return this.mapSessionFromDB(data);
    } catch (error) {
      logger.error('Error updating mediation session:', error);
      throw error;
    }
  }

  async getMediationSessions(filters: MediationFilters = {}, pagination: PaginationParams = { page: 1, limit: 10 }): Promise<MediationListResponse> {
    try {
      let query = this.supabase
        .from('mediation_sessions')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.mediatorId) {
        query = query.eq('mediator_id', filters.mediatorId);
      }
      if (filters.disputeId) {
        query = query.eq('dispute_id', filters.disputeId);
      }
      if (filters.dateFrom) {
        query = query.gte('scheduled_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('scheduled_at', filters.dateTo.toISOString());
      }
      if (filters.search) {
        query = query.or(`id.ilike.%${filters.search}%,dispute_id.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.range(offset, offset + pagination.limit - 1);

      // Apply sorting
      if (pagination.sortBy) {
        query = query.order(pagination.sortBy, { ascending: pagination.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const sessions = data?.map(session => this.mapSessionFromDB(session)) || [];

      return {
        mediations: sessions,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pagination.limit)
        }
      };
    } catch (error) {
      logger.error('Error getting mediation sessions:', error);
      throw error;
    }
  }

  async startMediationSession(sessionId: string): Promise<MediationSession> {
    try {
      const { data, error } = await this.supabase
        .from('mediation_sessions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Send notifications to participants
      const session = this.mapSessionFromDB(data);
      for (const participant of session.participants) {
        await this.sendNotification({
          userId: participant.userId,
          type: 'session_starting',
          title: 'Mediation Session Starting',
          message: `Mediation session ${sessionId} is now starting`,
          data: { sessionId, disputeId: session.disputeId },
          priority: 'high',
          isRead: false
        });
      }

      logger.info('Mediation session started', { sessionId });
      return session;
    } catch (error) {
      logger.error('Error starting mediation session:', error);
      throw error;
    }
  }

  async endMediationSession(sessionId: string, outcome: MediationOutcome): Promise<MediationSession> {
    try {
      const session = await this.getMediationSession(sessionId);
      if (!session) throw new Error('Session not found');

      const duration = session.startedAt ? 
        Math.floor((Date.now() - session.startedAt.getTime()) / (1000 * 60)) : 0;

      const { data, error } = await this.supabase
        .from('mediation_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          duration: duration,
          outcome: outcome,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Update mediator statistics
      await this.updateMediatorStats(session.mediatorId, outcome === 'settled' || outcome === 'partially_settled');

      // Send notifications to participants
      for (const participant of session.participants) {
        await this.sendNotification({
          userId: participant.userId,
          type: 'session_ended',
          title: 'Mediation Session Ended',
          message: `Mediation session ${sessionId} has ended with outcome: ${outcome}`,
          data: { sessionId, disputeId: session.disputeId, outcome },
          priority: 'medium',
          isRead: false
        });
      }

      logger.info('Mediation session ended', { sessionId, outcome });
      return this.mapSessionFromDB(data);
    } catch (error) {
      logger.error('Error ending mediation session:', error);
      throw error;
    }
  }

  // Settlement Agreement Management
  async createSettlementAgreement(agreementData: CreateSettlementAgreementDTO): Promise<SettlementAgreement> {
    try {
      const { data, error } = await this.supabase
        .from('settlement_agreements')
        .insert({
          mediation_session_id: agreementData.mediationSessionId,
          dispute_id: agreementData.disputeId,
          title: agreementData.title,
          description: agreementData.description,
          terms: agreementData.terms,
          status: 'draft',
          version: 1,
          is_active: true,
          signed_by: [],
          effective_date: new Date().toISOString(),
          template_id: agreementData.templateId,
          custom_clauses: agreementData.customClauses || [],
          attachments: agreementData.attachments || [],
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Settlement agreement created', { agreementId: data.id });
      return this.mapAgreementFromDB(data);
    } catch (error) {
      logger.error('Error creating settlement agreement:', error);
      throw error;
    }
  }

  async getSettlementAgreement(agreementId: string): Promise<SettlementAgreement | null> {
    try {
      const { data, error } = await this.supabase
        .from('settlement_agreements')
        .select('*')
        .eq('id', agreementId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapAgreementFromDB(data);
    } catch (error) {
      logger.error('Error getting settlement agreement:', error);
      throw error;
    }
  }

  async signAgreement(agreementId: string, signData: SignAgreementDTO, signatoryId: string): Promise<SettlementAgreement> {
    try {
      const agreement = await this.getSettlementAgreement(agreementId);
      if (!agreement) throw new Error('Agreement not found');

      const signature = {
        id: `sig_${Date.now()}`,
        signatoryId,
        signatoryName: 'User Name', // This should come from user data
        signatoryRole: 'client', // This should be determined based on user role
        signatureType: signData.signatureType,
        signatureData: signData.signatureData,
        signedAt: new Date(),
        ipAddress: signData.ipAddress,
        userAgent: signData.userAgent,
        isVerified: true,
        verificationMethod: 'digital_signature'
      };

      const updatedSignatures = [...agreement.signedBy, signature];

      const { data, error } = await this.supabase
        .from('settlement_agreements')
        .update({
          signed_by: updatedSignatures,
          status: updatedSignatures.length >= 2 ? 'signed' : 'pending_signatures',
          updated_at: new Date().toISOString()
        })
        .eq('id', agreementId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Agreement signed', { agreementId, signatoryId });
      return this.mapAgreementFromDB(data);
    } catch (error) {
      logger.error('Error signing agreement:', error);
      throw error;
    }
  }

  // Analytics
  async getMediationAnalytics(timeRange: string = '30d'): Promise<MediationAnalytics> {
    try {
      // This is a simplified implementation
      // TODO: calculate with actual data
      const mockAnalytics: MediationAnalytics = {
        totalMediations: 156,
        successfulMediations: 142,
        averageResolutionTime: 4.5,
        successRate: 91.0,
        mediatorPerformance: [],
        categoryBreakdown: [],
        timeToResolution: {
          average: 4.5,
          median: 4.0,
          p95: 8.0,
          p99: 12.0,
        byCategory: {} as Record<MediationCategory, number>,
        byMediator: {} as Record<string, number>
        },
        satisfactionScores: {
          overall: 4.2,
          byParticipant: {
            clients: 4.1,
            freelancers: 4.3
          },
        byCategory: {} as Record<MediationCategory, number>,
        byMediator: {} as Record<string, number>
        },
        costAnalysis: {
          totalPlatformCosts: 50000,
          totalMediatorCosts: 120000,
          averageCostPerMediation: 800,
          costSavings: 200000,
          roi: 2.4
        },
        trends: {
          monthlyGrowth: 15.5,
          categoryTrends: {} as Record<MediationCategory, number>,
          resolutionTimeTrends: [],
          satisfactionTrends: [],
          costTrends: []
        }
      };

      return mockAnalytics;
    } catch (error) {
      logger.error('Error getting mediation analytics:', error);
      throw error;
    }
  }

  // Notifications
  async sendNotification(notification: Omit<MediationNotification, 'id' | 'createdAt'>): Promise<MediationNotification> {
    try {
      const { data, error } = await this.supabase
        .from('mediation_notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          is_read: false,
          priority: notification.priority,
          scheduled_for: notification.scheduledFor?.toISOString(),
          sent_at: notification.sentAt?.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapNotificationFromDB(data);
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  // Escalation Management
  async escalateMediation(sessionId: string, reason: EscalationReason, escalatedBy: string): Promise<MediationEscalation> {
    try {
      const session = await this.getMediationSession(sessionId);
      if (!session) throw new Error('Session not found');

      const { data, error } = await this.supabase
        .from('mediation_escalations')
        .insert({
          mediation_session_id: sessionId,
          dispute_id: session.disputeId,
          from_stage: 'mediation',
          to_stage: 'arbitration',
          reason: reason,
          escalated_by: escalatedBy,
          escalated_at: new Date().toISOString(),
          status: 'pending',
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      // Update session status
      await this.updateMediationSession(sessionId, { status: 'escalated' });

      logger.info('Mediation escalated', { sessionId, reason });
      return this.mapEscalationFromDB(data);
    } catch (error) {
      logger.error('Error escalating mediation:', error);
      throw error;
    }
  }

  // Evidence Review Methods
  async reviewEvidence(
    sessionId: string, 
    evidenceId: string, 
    reviewerId: string, 
    reviewData: {
      isAccepted: boolean;
      reviewNotes?: string;
      rating?: number;
      categories?: string[];
      recommendations?: string[];
    }
  ): Promise<void> {
    try {
      const session = await this.getMediationSession(sessionId);
      if (!session) throw new Error('Mediation session not found');

      // Update evidence with review
      const updatedEvidence = session.evidence.map(evidence => {
        if (evidence.id === evidenceId) {
          return {
            ...evidence,
            isAccepted: reviewData.isAccepted,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            reviewNotes: reviewData.reviewNotes,
            rating: reviewData.rating,
            categories: reviewData.categories,
            recommendations: reviewData.recommendations
          };
        }
        return evidence;
      });

      await this.supabase
        .from('mediation_sessions')
        .update({
          evidence: updatedEvidence,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);


      // Send notification to evidence submitter
      const evidence = session.evidence.find(e => e.id === evidenceId);
      if (evidence) {
        await this.sendNotification({
          userId: evidence.submittedBy,
          type: 'evidence_reviewed' as any,
          title: 'Evidence Review Complete',
          message: `Your evidence "${evidence.title}" has been reviewed and ${reviewData.isAccepted ? 'accepted' : 'rejected'}`,
          data: { sessionId, evidenceId, reviewData },
          priority: 'medium',
          isRead: false
        });
      }

      logger.info('Evidence reviewed successfully', { sessionId, evidenceId, reviewerId });
    } catch (error) {
      logger.error('Error reviewing evidence:', error);
      throw error;
    }
  }

  async getEvidenceReviewSummary(sessionId: string): Promise<{
    totalEvidence: number;
    reviewedEvidence: number;
    acceptedEvidence: number;
    rejectedEvidence: number;
    averageRating: number;
    reviewProgress: number;
    pendingReviews: Array<{
      id: string;
      title: string;
      submittedBy: string;
      submittedAt: Date;
      type: string;
    }>;
  }> {
    try {
      const session = await this.getMediationSession(sessionId);
      if (!session) throw new Error('Mediation session not found');

      const evidence = session.evidence;
      const totalEvidence = evidence.length;
      const reviewedEvidence = evidence.filter(e => e.reviewedBy).length;
      const acceptedEvidence = evidence.filter(e => e.isAccepted).length;
      const rejectedEvidence = evidence.filter(e => e.reviewedBy && !e.isAccepted).length;
      
      const ratings = evidence.filter(e => e.rating).map(e => e.rating!);
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
      
      const reviewProgress = totalEvidence > 0 ? (reviewedEvidence / totalEvidence) * 100 : 0;
      
      const pendingReviews = evidence
        .filter(e => !e.reviewedBy)
        .map(e => ({
          id: e.id,
          title: e.title,
          submittedBy: e.submittedBy,
          submittedAt: e.submittedAt,
          type: e.type
        }));

      return {
        totalEvidence,
        reviewedEvidence,
        acceptedEvidence,
        rejectedEvidence,
        averageRating,
        reviewProgress,
        pendingReviews
      };
    } catch (error) {
      logger.error('Error getting evidence review summary:', error);
      throw error;
    }
  }

  async bulkReviewEvidence(
    sessionId: string,
    reviewerId: string,
    reviews: Array<{
      evidenceId: string;
      isAccepted: boolean;
      reviewNotes?: string;
      rating?: number;
      categories?: string[];
    }>
  ): Promise<void> {
    try {
      const session = await this.getMediationSession(sessionId);
      if (!session) throw new Error('Mediation session not found');

      // Update all evidence with reviews
      const updatedEvidence = session.evidence.map(evidence => {
        const review = reviews.find(r => r.evidenceId === evidence.id);
        if (review) {
          return {
            ...evidence,
            isAccepted: review.isAccepted,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            reviewNotes: review.reviewNotes,
            rating: review.rating,
            categories: review.categories
          };
        }
        return evidence;
      });

      await this.supabase
        .from('mediation_sessions')
        .update({
          evidence: updatedEvidence,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);


      logger.info('Bulk evidence review completed', { sessionId, reviewerId, reviewCount: reviews.length });
    } catch (error) {
      logger.error('Error in bulk evidence review:', error);
      throw error;
    }
  }

  // Quality Assurance Methods
  async submitMediationFeedback(
    sessionId: string,
    feedbackData: {
      participantId: string;
      mediatorRating: number;
      processRating: number;
      outcomeRating: number;
      communicationRating: number;
      fairnessRating: number;
      overallSatisfaction: number;
      comments?: string;
      suggestions?: string;
      wouldRecommend: boolean;
      categories: string[];
    }
  ): Promise<void> {
    try {
      const session = await this.getMediationSession(sessionId);
      if (!session) throw new Error('Mediation session not found');

      // Store feedback in session metadata
      const existingFeedback = session.metadata.feedback || [];
      const newFeedback = {
        id: `feedback_${Date.now()}`,
        ...feedbackData,
        submittedAt: new Date(),
        sessionId
      };

      const updatedMetadata = {
        ...session.metadata,
        feedback: [...existingFeedback, newFeedback]
      };

      await this.supabase
        .from('mediation_sessions')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Update mediator performance metrics
      await this.updateMediatorPerformanceMetrics(session.mediatorId, feedbackData);


      logger.info('Mediation feedback submitted', { sessionId, participantId: feedbackData.participantId });
    } catch (error) {
      logger.error('Error submitting mediation feedback:', error);
      throw error;
    }
  }

  async getMediationQualityMetrics(sessionId: string): Promise<{
    averageMediatorRating: number;
    averageProcessRating: number;
    averageOutcomeRating: number;
    averageCommunicationRating: number;
    averageFairnessRating: number;
    overallSatisfaction: number;
    recommendationRate: number;
    feedbackCount: number;
    qualityScore: number;
    improvementAreas: string[];
    strengths: string[];
  }> {
    try {
      const session = await this.getMediationSession(sessionId);
      if (!session) throw new Error('Mediation session not found');

      const feedback = session.metadata.feedback || [];
      
      if (feedback.length === 0) {
        return {
          averageMediatorRating: 0,
          averageProcessRating: 0,
          averageOutcomeRating: 0,
          averageCommunicationRating: 0,
          averageFairnessRating: 0,
          overallSatisfaction: 0,
          recommendationRate: 0,
          feedbackCount: 0,
          qualityScore: 0,
          improvementAreas: [],
          strengths: []
        };
      }

      const ratings = {
        mediator: feedback.map((f: any) => f.mediatorRating),
        process: feedback.map((f: any) => f.processRating),
        outcome: feedback.map((f: any) => f.outcomeRating),
        communication: feedback.map((f: any) => f.communicationRating),
        fairness: feedback.map((f: any) => f.fairnessRating),
        overall: feedback.map((f: any) => f.overallSatisfaction)
      };

      const averages = {
        mediator: ratings.mediator.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.mediator.length,
        process: ratings.process.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.process.length,
        outcome: ratings.outcome.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.outcome.length,
        communication: ratings.communication.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.communication.length,
        fairness: ratings.fairness.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.fairness.length,
        overall: ratings.overall.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.overall.length
      };

      const recommendationRate = (feedback.filter((f: any) => f.wouldRecommend).length / feedback.length) * 100;
      
      // Calculate quality score (weighted average)
      const qualityScore = (
        averages.mediator * 0.25 +
        averages.process * 0.20 +
        averages.outcome * 0.25 +
        averages.communication * 0.15 +
        averages.fairness * 0.15
      );

      // Identify improvement areas and strengths
      const improvementAreas = [];
      const strengths = [];

      if (averages.mediator < 3.5) improvementAreas.push('Mediator Performance');
      else strengths.push('Mediator Performance');

      if (averages.process < 3.5) improvementAreas.push('Process Efficiency');
      else strengths.push('Process Efficiency');

      if (averages.outcome < 3.5) improvementAreas.push('Outcome Satisfaction');
      else strengths.push('Outcome Satisfaction');

      if (averages.communication < 3.5) improvementAreas.push('Communication');
      else strengths.push('Communication');

      if (averages.fairness < 3.5) improvementAreas.push('Fairness');
      else strengths.push('Fairness');

      return {
        averageMediatorRating: Math.round(averages.mediator * 10) / 10,
        averageProcessRating: Math.round(averages.process * 10) / 10,
        averageOutcomeRating: Math.round(averages.outcome * 10) / 10,
        averageCommunicationRating: Math.round(averages.communication * 10) / 10,
        averageFairnessRating: Math.round(averages.fairness * 10) / 10,
        overallSatisfaction: Math.round(averages.overall * 10) / 10,
        recommendationRate: Math.round(recommendationRate * 10) / 10,
        feedbackCount: feedback.length,
        qualityScore: Math.round(qualityScore * 10) / 10,
        improvementAreas,
        strengths
      };
    } catch (error) {
      logger.error('Error getting mediation quality metrics:', error);
      throw error;
    }
  }

  async generateQualityReport(sessionId: string): Promise<{
    sessionId: string;
    disputeId: string;
    mediatorId: string;
    reportDate: Date;
    qualityMetrics: any;
    evidenceReview: any;
    recommendations: string[];
    actionItems: string[];
  }> {
    try {
      const session = await this.getMediationSession(sessionId);
      if (!session) throw new Error('Mediation session not found');

      const qualityMetrics = await this.getMediationQualityMetrics(sessionId);
      const evidenceReview = await this.getEvidenceReviewSummary(sessionId);

      const recommendations = [];
      const actionItems = [];

      // Generate recommendations based on metrics
      if (qualityMetrics.averageMediatorRating < 3.5) {
        recommendations.push('Consider additional mediator training or reassignment');
        actionItems.push('Schedule mediator performance review');
      }

      if (qualityMetrics.averageProcessRating < 3.5) {
        recommendations.push('Review and optimize mediation process workflow');
        actionItems.push('Update mediation process documentation');
      }

      if (evidenceReview.reviewProgress < 100) {
        recommendations.push('Complete pending evidence reviews');
        actionItems.push('Assign additional reviewers for evidence');
      }

      if (qualityMetrics.recommendationRate < 70) {
        recommendations.push('Improve overall mediation experience');
        actionItems.push('Conduct participant feedback analysis');
      }

      const report = {
        sessionId,
        disputeId: session.disputeId,
        mediatorId: session.mediatorId,
        reportDate: new Date(),
        qualityMetrics,
        evidenceReview,
        recommendations,
        actionItems
      };

      // Store report in session metadata
      const updatedMetadata = {
        ...session.metadata,
        qualityReport: report
      };

      await this.supabase
        .from('mediation_sessions')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      logger.info('Quality report generated', { sessionId });
      return report;
    } catch (error) {
      logger.error('Error generating quality report:', error);
      throw error;
    }
  }

  async updateMediatorPerformanceMetrics(mediatorId: string, feedbackData: any): Promise<void> {
    try {
      const mediator = await this.getMediator(mediatorId);
      if (!mediator) return;

      // Calculate new average rating
      const currentRating = mediator.rating;
      const totalMediations = mediator.totalMediations;
      const newRating = ((currentRating * totalMediations) + feedbackData.mediatorRating) / (totalMediations + 1);

      await this.supabase
        .from('mediators')
        .update({
          rating: Math.round(newRating * 10) / 10,
          updated_at: new Date().toISOString()
        })
        .eq('id', mediatorId);

      logger.info('Mediator performance metrics updated', { mediatorId, newRating });
    } catch (error) {
      logger.error('Error updating mediator performance metrics:', error);
    }
  }

  async getPlatformQualityAnalytics(timeRange: string = '30d'): Promise<{
    totalSessions: number;
    averageQualityScore: number;
    averageSatisfaction: number;
    recommendationRate: number;
    topPerformingMediators: Array<{
      mediatorId: string;
      name: string;
      rating: number;
      sessionCount: number;
    }>;
    improvementTrends: Array<{
      month: string;
      qualityScore: number;
      satisfaction: number;
    }>;
    commonIssues: Array<{
      issue: string;
      frequency: number;
      percentage: number;
    }>;
  }> {
    try {
      // This would query actual data in production
      // For now, returning mock data with realistic structure
      const mockAnalytics = {
        totalSessions: 156,
        averageQualityScore: 4.2,
        averageSatisfaction: 4.1,
        recommendationRate: 78.5,
        topPerformingMediators: [
          {
            mediatorId: 'mediator-1',
            name: 'Dr. Sarah Johnson',
            rating: 4.8,
            sessionCount: 45
          },
          {
            mediatorId: 'mediator-2',
            name: 'Prof. David Lee',
            rating: 4.9,
            sessionCount: 38
          }
        ],
        improvementTrends: [
          { month: '2024-01', qualityScore: 4.0, satisfaction: 3.9 },
          { month: '2024-02', qualityScore: 4.1, satisfaction: 4.0 },
          { month: '2024-03', qualityScore: 4.2, satisfaction: 4.1 }
        ],
        commonIssues: [
          { issue: 'Communication delays', frequency: 23, percentage: 14.7 },
          { issue: 'Process complexity', frequency: 18, percentage: 11.5 },
          { issue: 'Evidence review delays', frequency: 15, percentage: 9.6 },
          { issue: 'Settlement implementation', frequency: 12, percentage: 7.7 }
        ]
      };

      return mockAnalytics;
    } catch (error) {
      logger.error('Error getting platform quality analytics:', error);
      throw error;
    }
  }

  // Helper Methods
  private async updateMediatorStats(mediatorId: string, wasSuccessful: boolean): Promise<void> {
    try {
      const mediator = await this.getMediator(mediatorId);
      if (!mediator) return;

      const updates = {
        total_mediations: mediator.totalMediations + 1,
        successful_mediations: mediator.successfulMediations + (wasSuccessful ? 1 : 0),
        updated_at: new Date().toISOString()
      };

      await this.supabase
        .from('mediators')
        .update(updates)
        .eq('id', mediatorId);
    } catch (error) {
      logger.error('Error updating mediator stats:', error);
    }
  }

  // Database mapping methods
  private mapMediatorFromDB(data: any): Mediator {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      profileImage: data.profile_image,
      expertiseAreas: data.expertise_areas || [],
      languages: data.languages || [],
      availability: data.availability || {},
      rating: data.rating || 0,
      totalMediations: data.total_mediations || 0,
      successfulMediations: data.successful_mediations || 0,
      averageResolutionTime: data.average_resolution_time || 0,
      hourlyRate: data.hourly_rate,
      currency: data.currency || 'USD',
      isActive: data.is_active || false,
      isVerified: data.is_verified || false,
      verificationDocuments: data.verification_documents || [],
      specializations: data.specializations || [],
      certifications: data.certifications || [],
      experience: data.experience || [],
      preferences: data.preferences || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapSessionFromDB(data: any): MediationSession {
    return {
      id: data.id,
      disputeId: data.dispute_id,
      mediatorId: data.mediator_id,
      status: data.status,
      type: data.type,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
      duration: data.duration,
      location: data.location,
      meetingType: data.meeting_type,
      meetingUrl: data.meeting_url,
      participants: data.participants || [],
      agenda: data.agenda || [],
      notes: data.notes || [],
      evidence: data.evidence || [],
      proposals: data.proposals || [],
      outcome: data.outcome,
      followUpRequired: data.follow_up_required || false,
      followUpDate: data.follow_up_date ? new Date(data.follow_up_date) : undefined,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapAgreementFromDB(data: any): SettlementAgreement {
    return {
      id: data.id,
      mediationSessionId: data.mediation_session_id,
      disputeId: data.dispute_id,
      title: data.title,
      description: data.description,
      terms: data.terms,
      status: data.status,
      version: data.version,
      isActive: data.is_active,
      signedBy: data.signed_by || [],
      effectiveDate: new Date(data.effective_date),
      expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      templateId: data.template_id,
      customClauses: data.custom_clauses || [],
      attachments: data.attachments || [],
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapAssignmentFromDB(data: any): MediationAssignment {
    return {
      id: data.id,
      disputeId: data.dispute_id,
      mediatorId: data.mediator_id,
      assignmentType: data.assignment_type,
      assignedBy: data.assigned_by,
      assignedAt: new Date(data.assigned_at),
      status: data.status,
      priority: data.priority,
      estimatedDuration: data.estimated_duration,
      actualDuration: data.actual_duration,
      reason: data.reason,
      notes: data.notes,
      acceptedAt: data.accepted_at ? new Date(data.accepted_at) : undefined,
      declinedAt: data.declined_at ? new Date(data.declined_at) : undefined,
      declineReason: data.decline_reason,
      metadata: data.metadata || {}
    };
  }

  private mapNotificationFromDB(data: any): MediationNotification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      isRead: data.is_read || false,
      priority: data.priority,
      scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      readAt: data.read_at ? new Date(data.read_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  private mapEscalationFromDB(data: any): MediationEscalation {
    return {
      id: data.id,
      mediationSessionId: data.mediation_session_id,
      disputeId: data.dispute_id,
      fromStage: data.from_stage,
      toStage: data.to_stage,
      reason: data.reason,
      escalatedBy: data.escalated_by,
      escalatedAt: new Date(data.escalated_at),
      status: data.status,
      resolution: data.resolution,
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      resolvedBy: data.resolved_by,
      metadata: data.metadata || {}
    };
  }

  
  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('mediators')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      return false;
    }
  }
}
