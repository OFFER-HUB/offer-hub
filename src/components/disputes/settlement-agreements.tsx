'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  FileText,
  Scale,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  DollarSign,
  Percent,
  Clock3,
  Shield,
  PenTool,
  Send,
  Archive,
  Copy,
  Share,
  MoreVertical
} from 'lucide-react';

interface SettlementAgreement {
  id: string;
  mediationSessionId: string;
  disputeId: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_signatures' | 'signed' | 'active' | 'completed' | 'breached' | 'terminated' | 'expired';
  version: number;
  isActive: boolean;
  signedBy: Array<{
    id: string;
    signatoryId: string;
    signatoryName: string;
    signatoryRole: 'client' | 'freelancer' | 'mediator' | 'witness';
    signatureType: 'digital' | 'electronic' | 'wet_signature';
    signatureData: string;
    signedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    isVerified: boolean;
    verificationMethod?: string;
  }>;
  effectiveDate: Date;
  expiryDate?: Date;
  templateId?: string;
  customClauses: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
    isRequired: boolean;
    addedBy: string;
    addedAt: Date;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedAt: Date;
    isRequired: boolean;
  }>;
  terms: {
    financialSettlement: {
      totalAmount: number;
      currency: string;
      paymentSchedule: Array<{
        amount: number;
        dueDate: Date;
        recipient: string;
        description: string;
        status: 'pending' | 'paid' | 'overdue' | 'cancelled';
      }>;
      refundAmount?: number;
      penaltyAmount?: number;
      feeAllocation: {
        platformFee: number;
        mediatorFee: number;
        clientAmount: number;
        freelancerAmount: number;
      };
    };
    nonFinancialTerms: Array<{
      id: string;
      type: 'apology' | 'work_revision' | 'future_work' | 'reference' | 'other';
      description: string;
      deadline?: Date;
      isCompleted: boolean;
      completedAt?: Date;
      verifiedBy?: string;
    }>;
    implementationTimeline: {
      startDate: Date;
      endDate: Date;
      milestones: Array<{
        id: string;
        description: string;
        dueDate: Date;
        isCompleted: boolean;
        completedAt?: Date;
        dependencies: string[];
      }>;
      isFlexible: boolean;
    };
    enforcementMechanisms: Array<{
      id: string;
      type: 'escrow_hold' | 'performance_bond' | 'penalty_clause' | 'arbitration' | 'other';
      description: string;
      amount?: number;
      conditions: string[];
    }>;
    confidentialityClause?: string;
    nonDisclosureClause?: string;
    disputeResolutionClause?: string;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SettlementAgreements: React.FC = () => {
  const [agreements, setAgreements] = useState<SettlementAgreement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgreement, setSelectedAgreement] = useState<SettlementAgreement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAgreements: SettlementAgreement[] = [
      {
        id: 'agreement-1',
        mediationSessionId: 'session-1',
        disputeId: 'dispute-1',
        title: 'Project Deliverables Settlement Agreement',
        description: 'Resolution of quality dispute regarding website development project with timeline extension and additional compensation',
        status: 'signed',
        version: 1,
        isActive: true,
        signedBy: [
          {
            id: 'sig-1',
            signatoryId: 'user-1',
            signatoryName: 'John Doe',
            signatoryRole: 'client',
            signatureType: 'digital',
            signatureData: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
            signedAt: new Date('2024-01-18T17:00:00Z'),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            isVerified: true,
            verificationMethod: 'digital_signature'
          },
          {
            id: 'sig-2',
            signatoryId: 'user-2',
            signatoryName: 'Jane Smith',
            signatoryRole: 'freelancer',
            signatureType: 'digital',
            signatureData: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
            signedAt: new Date('2024-01-18T17:15:00Z'),
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            isVerified: true,
            verificationMethod: 'digital_signature'
          }
        ],
        effectiveDate: new Date('2024-01-18T17:30:00Z'),
        expiryDate: new Date('2024-04-18T17:30:00Z'),
        templateId: 'template-standard-001',
        customClauses: [
          {
            id: 'clause-1',
            title: 'Quality Assurance Clause',
            content: 'The freelancer agrees to provide 30 days of post-delivery support for any bugs or issues related to the delivered work.',
            order: 1,
            isRequired: true,
            addedBy: 'user-3',
            addedAt: new Date('2024-01-18T16:45:00Z')
          }
        ],
        attachments: [
          {
            id: 'att-1',
            name: 'Original Contract.pdf',
            fileUrl: '/documents/contract.pdf',
            fileType: 'application/pdf',
            fileSize: 245760,
            uploadedBy: 'user-3',
            uploadedAt: new Date('2024-01-18T16:30:00Z'),
            isRequired: true
          }
        ],
        terms: {
          financialSettlement: {
            totalAmount: 5000,
            currency: 'USD',
            paymentSchedule: [
              {
                amount: 2500,
                dueDate: new Date('2024-01-25T00:00:00Z'),
                recipient: 'Jane Smith',
                description: 'Initial payment for completed work',
                status: 'paid'
              },
              {
                amount: 2000,
                dueDate: new Date('2024-02-15T00:00:00Z'),
                recipient: 'Jane Smith',
                description: 'Additional compensation for scope changes',
                status: 'pending'
              },
              {
                amount: 500,
                dueDate: new Date('2024-02-15T00:00:00Z'),
                recipient: 'Platform',
                description: 'Platform fee',
                status: 'pending'
              }
            ],
            feeAllocation: {
              platformFee: 500,
              mediatorFee: 200,
              clientAmount: 2000,
              freelancerAmount: 2300
            }
          },
          nonFinancialTerms: [
            {
              id: 'nft-1',
              type: 'work_revision',
              description: 'Revise homepage design to match client specifications',
              deadline: new Date('2024-02-01T00:00:00Z'),
              isCompleted: false,
              verifiedBy: 'user-1'
            },
            {
              id: 'nft-2',
              type: 'reference',
              description: 'Provide positive reference for freelancer on platform',
              deadline: new Date('2024-02-15T00:00:00Z'),
              isCompleted: false
            }
          ],
          implementationTimeline: {
            startDate: new Date('2024-01-18T17:30:00Z'),
            endDate: new Date('2024-02-15T00:00:00Z'),
            milestones: [
              {
                id: 'milestone-1',
                description: 'Payment of initial amount',
                dueDate: new Date('2024-01-25T00:00:00Z'),
                isCompleted: true,
                completedAt: new Date('2024-01-20T10:00:00Z'),
                dependencies: []
              },
              {
                id: 'milestone-2',
                description: 'Work revision completion',
                dueDate: new Date('2024-02-01T00:00:00Z'),
                isCompleted: false,
                dependencies: ['milestone-1']
              },
              {
                id: 'milestone-3',
                description: 'Final payment and reference',
                dueDate: new Date('2024-02-15T00:00:00Z'),
                isCompleted: false,
                dependencies: ['milestone-2']
              }
            ],
            isFlexible: true
          },
          enforcementMechanisms: [
            {
              id: 'em-1',
              type: 'escrow_hold',
              description: 'Final payment held in escrow until work revision is completed',
              amount: 2000,
              conditions: ['Work revision must be completed and approved by client']
            }
          ],
          confidentialityClause: 'Both parties agree to maintain confidentiality of all settlement terms and not disclose them to third parties without written consent.',
          disputeResolutionClause: 'Any disputes arising from this agreement shall be resolved through binding arbitration.'
        },
        metadata: {
          createdBy: 'user-3',
          lastModifiedBy: 'user-3',
          tags: ['quality_dispute', 'timeline_extension', 'compensation']
        },
        createdAt: new Date('2024-01-18T16:30:00Z'),
        updatedAt: new Date('2024-01-18T17:15:00Z')
      },
      {
        id: 'agreement-2',
        mediationSessionId: 'session-2',
        disputeId: 'dispute-2',
        title: 'Payment Dispute Resolution',
        description: 'Resolution of late payment dispute with penalty waiver and payment plan',
        status: 'pending_signatures',
        version: 1,
        isActive: true,
        signedBy: [
          {
            id: 'sig-3',
            signatoryId: 'user-4',
            signatoryName: 'Mike Wilson',
            signatoryRole: 'client',
            signatureType: 'digital',
            signatureData: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
            signedAt: new Date('2024-01-19T14:00:00Z'),
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            isVerified: true,
            verificationMethod: 'digital_signature'
          }
        ],
        effectiveDate: new Date('2024-01-19T14:30:00Z'),
        templateId: 'template-payment-001',
        customClauses: [],
        attachments: [],
        terms: {
          financialSettlement: {
            totalAmount: 3000,
            currency: 'USD',
            paymentSchedule: [
              {
                amount: 1000,
                dueDate: new Date('2024-01-26T00:00:00Z'),
                recipient: 'Lisa Brown',
                description: 'First installment',
                status: 'pending'
              },
              {
                amount: 1000,
                dueDate: new Date('2024-02-26T00:00:00Z'),
                recipient: 'Lisa Brown',
                description: 'Second installment',
                status: 'pending'
              },
              {
                amount: 1000,
                dueDate: new Date('2024-03-26T00:00:00Z'),
                recipient: 'Lisa Brown',
                description: 'Final installment',
                status: 'pending'
              }
            ],
            feeAllocation: {
              platformFee: 300,
              mediatorFee: 150,
              clientAmount: 1500,
              freelancerAmount: 1050
            }
          },
          nonFinancialTerms: [],
          implementationTimeline: {
            startDate: new Date('2024-01-19T14:30:00Z'),
            endDate: new Date('2024-03-26T00:00:00Z'),
            milestones: [
              {
                id: 'milestone-4',
                description: 'First payment',
                dueDate: new Date('2024-01-26T00:00:00Z'),
                isCompleted: false,
                dependencies: []
              },
              {
                id: 'milestone-5',
                description: 'Second payment',
                dueDate: new Date('2024-02-26T00:00:00Z'),
                isCompleted: false,
                dependencies: ['milestone-4']
              },
              {
                id: 'milestone-6',
                description: 'Final payment',
                dueDate: new Date('2024-03-26T00:00:00Z'),
                isCompleted: false,
                dependencies: ['milestone-5']
              }
            ],
            isFlexible: false
          },
          enforcementMechanisms: [
            {
              id: 'em-2',
              type: 'penalty_clause',
              description: 'Late payment penalty of 5% per month',
              amount: 150,
              conditions: ['Payment must be made within 5 days of due date']
            }
          ]
        },
        metadata: {
          createdBy: 'user-5',
          lastModifiedBy: 'user-5',
          tags: ['payment_dispute', 'installment_plan']
        },
        createdAt: new Date('2024-01-19T13:45:00Z'),
        updatedAt: new Date('2024-01-19T14:00:00Z')
      }
    ];

    setAgreements(mockAgreements);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_signatures': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'breached': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'pending_signatures': return <Clock className="h-4 w-4" />;
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Scale className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'breached': return <XCircle className="h-4 w-4" />;
      case 'terminated': return <AlertCircle className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAgreements = agreements.filter(agreement => {
    const matchesSearch = agreement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agreement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agreement.disputeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agreement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderAgreementCard = (agreement: SettlementAgreement) => (
    <Card key={agreement.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{agreement.title}</CardTitle>
            <p className="text-sm text-gray-600">{agreement.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(agreement.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(agreement.status)}
                {agreement.status.replace('_', ' ')}
              </div>
            </Badge>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Dispute:</span> {agreement.disputeId}
            </div>
            <div className="text-sm">
              <span className="font-medium">Version:</span> {agreement.version}
            </div>
            <div className="text-sm">
              <span className="font-medium">Effective Date:</span> {
                new Date(agreement.effectiveDate).toLocaleDateString()
              }
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Total Amount:</span> ${agreement.terms.financialSettlement.totalAmount}
            </div>
            <div className="text-sm">
              <span className="font-medium">Signatures:</span> {agreement.signedBy.length}/2
            </div>
            <div className="text-sm">
              <span className="font-medium">Attachments:</span> {agreement.attachments.length}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Created:</span> {
                new Date(agreement.createdAt).toLocaleDateString()
              }
            </div>
            {agreement.expiryDate && (
              <div className="text-sm">
                <span className="font-medium">Expires:</span> {
                  new Date(agreement.expiryDate).toLocaleDateString()
                }
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">Custom Clauses:</span> {agreement.customClauses.length}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedAgreement(agreement)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {agreement.status === 'pending_signatures' && (
            <Button 
              size="sm"
              onClick={() => {
                setSelectedAgreement(agreement);
                setIsSignDialogOpen(true);
              }}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Sign Agreement
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAgreementDetails = () => {
    if (!selectedAgreement) return null;

    return (
      <Dialog open={!!selectedAgreement} onOpenChange={() => setSelectedAgreement(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              {selectedAgreement.title}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="terms">Terms</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="signatures">Signatures</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agreement Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Status:</span>
                      <Badge className={`ml-2 ${getStatusColor(selectedAgreement.status)}`}>
                        {selectedAgreement.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Version:</span> {selectedAgreement.version}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Dispute ID:</span> {selectedAgreement.disputeId}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Session ID:</span> {selectedAgreement.mediationSessionId}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Effective Date:</span> {
                        new Date(selectedAgreement.effectiveDate).toLocaleString()
                      }
                    </div>
                    {selectedAgreement.expiryDate && (
                      <div className="text-sm">
                        <span className="font-medium">Expiry Date:</span> {
                          new Date(selectedAgreement.expiryDate).toLocaleString()
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Total Amount:</span> ${selectedAgreement.terms.financialSettlement.totalAmount}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Currency:</span> {selectedAgreement.terms.financialSettlement.currency}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Platform Fee:</span> ${selectedAgreement.terms.financialSettlement.feeAllocation.platformFee}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Mediator Fee:</span> ${selectedAgreement.terms.financialSettlement.feeAllocation.mediatorFee}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Client Amount:</span> ${selectedAgreement.terms.financialSettlement.feeAllocation.clientAmount}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Freelancer Amount:</span> ${selectedAgreement.terms.financialSettlement.feeAllocation.freelancerAmount}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{selectedAgreement.description}</p>
                </CardContent>
              </Card>

              {selectedAgreement.customClauses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Clauses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedAgreement.customClauses.map((clause) => (
                      <div key={clause.id} className="p-3 border rounded">
                        <h4 className="font-medium">{clause.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{clause.content}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            Added by {clause.addedBy} on {new Date(clause.addedAt).toLocaleDateString()}
                          </span>
                          {clause.isRequired && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="terms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Payment Schedule</h4>
                      <div className="space-y-2">
                        {selectedAgreement.terms.financialSettlement.paymentSchedule.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <div>
                              <p className="text-sm font-medium">${payment.amount}</p>
                              <p className="text-xs text-gray-500">{payment.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getPaymentStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                              <p className="text-xs text-gray-500">
                                Due: {new Date(payment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Fee Allocation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Platform Fee:</span>
                          <span className="text-sm font-medium">${selectedAgreement.terms.financialSettlement.feeAllocation.platformFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Mediator Fee:</span>
                          <span className="text-sm font-medium">${selectedAgreement.terms.financialSettlement.feeAllocation.mediatorFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Client Amount:</span>
                          <span className="text-sm font-medium">${selectedAgreement.terms.financialSettlement.feeAllocation.clientAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Freelancer Amount:</span>
                          <span className="text-sm font-medium">${selectedAgreement.terms.financialSettlement.feeAllocation.freelancerAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedAgreement.terms.nonFinancialTerms.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Non-Financial Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedAgreement.terms.nonFinancialTerms.map((term) => (
                      <div key={term.id} className="flex justify-between items-start p-3 border rounded">
                        <div>
                          <h4 className="font-medium capitalize">{term.type.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-600 mt-1">{term.description}</p>
                          {term.deadline && (
                            <p className="text-xs text-gray-500 mt-1">
                              Deadline: {new Date(term.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={term.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {term.isCompleted ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Implementation Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Start Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedAgreement.terms.implementationTimeline.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">End Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedAgreement.terms.implementationTimeline.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Flexible Timeline:</span>
                      <span className="text-sm font-medium">
                        {selectedAgreement.terms.implementationTimeline.isFlexible ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mt-4 mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {selectedAgreement.terms.implementationTimeline.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{milestone.description}</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={milestone.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {milestone.isCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedAgreement.terms.financialSettlement.paymentSchedule.map((payment, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">${payment.amount} - {payment.description}</h4>
                            <p className="text-sm text-gray-600">Recipient: {payment.recipient}</p>
                          </div>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                          <span>Amount: ${payment.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signatures" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Digital Signatures</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedAgreement.signedBy.map((signature) => (
                    <div key={signature.id} className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <PenTool className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{signature.signatoryName}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {signature.signatoryRole} • {signature.signatureType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {signature.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {signature.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(signature.signedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attachments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedAgreement.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{attachment.name}</p>
                          <p className="text-sm text-gray-500">
                            {attachment.fileType} • {Math.round(attachment.fileSize / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {attachment.isRequired && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settlement Agreements</h2>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Agreement
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search agreements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_signatures">Pending Signatures</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="breached">Breached</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredAgreements.map(renderAgreementCard)}
      </div>

      {renderAgreementDetails()}

      {/* Create Agreement Dialog - Placeholder */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Settlement Agreement</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Settlement agreement creation form will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Agreement Dialog - Placeholder */}
      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sign Settlement Agreement</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Digital signature interface will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettlementAgreements;
