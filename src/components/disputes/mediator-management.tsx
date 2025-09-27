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
  Star, 
  Clock, 
  Users, 
  Award, 
  Shield, 
  Globe, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Download
} from 'lucide-react';

interface Mediator {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  expertiseAreas: Array<{
    id: string;
    category: string;
    subcategories: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
    yearsOfExperience: number;
    caseCount: number;
    successRate: number;
  }>;
  languages: string[];
  availability: {
    timezone: string;
    workingHours: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
    maxConcurrentMediations: number;
    responseTime: number;
  };
  rating: number;
  totalMediations: number;
  successfulMediations: number;
  averageResolutionTime: number;
  hourlyRate?: number;
  currency: string;
  isActive: boolean;
  isVerified: boolean;
  verificationDocuments: Array<{
    id: string;
    type: 'license' | 'certification' | 'identity' | 'background_check';
    name: string;
    fileUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: Date;
  }>;
  specializations: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId: string;
  }>;
  experience: Array<{
    id: string;
    organization: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    isCurrent: boolean;
  }>;
  preferences: {
    preferredDisputeTypes: string[];
    preferredDisputeSizes: string[];
    maxDisputeAmount: number;
    minDisputeAmount: number;
    autoAcceptAssignments: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MediatorManagement: React.FC = () => {
  const [mediators, setMediators] = useState<Mediator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expertiseFilter, setExpertiseFilter] = useState('all');
  const [selectedMediator, setSelectedMediator] = useState<Mediator | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockMediators: Mediator[] = [
      {
        id: 'mediator-1',
        userId: 'user-3',
        name: 'Dr. Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1-555-0123',
        bio: 'Experienced mediator specializing in contract disputes and payment issues with over 8 years of experience in freelance and business mediation.',
        profileImage: '/avatars/sarah.jpg',
        expertiseAreas: [
          {
            id: 'exp-1',
            category: 'contract_dispute',
            subcategories: ['payment', 'scope', 'timeline'],
            experienceLevel: 'expert',
            yearsOfExperience: 8,
            caseCount: 156,
            successRate: 91.0
          },
          {
            id: 'exp-2',
            category: 'payment_dispute',
            subcategories: ['late_payment', 'partial_payment', 'refund'],
            experienceLevel: 'expert',
            yearsOfExperience: 6,
            caseCount: 89,
            successRate: 94.4
          }
        ],
        languages: ['English', 'Spanish', 'French'],
        availability: {
          timezone: 'EST',
          workingHours: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isAvailable: true },
            { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isAvailable: false }
          ],
          maxConcurrentMediations: 5,
          responseTime: 2
        },
        rating: 4.8,
        totalMediations: 156,
        successfulMediations: 142,
        averageResolutionTime: 4.2,
        hourlyRate: 150,
        currency: 'USD',
        isActive: true,
        isVerified: true,
        verificationDocuments: [
          {
            id: 'doc-1',
            type: 'certification',
            name: 'Certified Mediator License',
            fileUrl: '/documents/sarah-license.pdf',
            status: 'approved',
            uploadedAt: new Date('2023-01-15')
          },
          {
            id: 'doc-2',
            type: 'background_check',
            name: 'Background Check Report',
            fileUrl: '/documents/sarah-background.pdf',
            status: 'approved',
            uploadedAt: new Date('2023-01-20')
          }
        ],
        specializations: ['Contract Law', 'Payment Disputes', 'Freelance Agreements', 'Business Mediation'],
        certifications: [
          {
            id: 'cert-1',
            name: 'Certified Mediator',
            issuingOrganization: 'American Arbitration Association',
            issueDate: new Date('2020-03-15'),
            expiryDate: new Date('2025-03-15'),
            credentialId: 'AAA-CM-2020-001'
          },
          {
            id: 'cert-2',
            name: 'Advanced Mediation Techniques',
            issuingOrganization: 'International Mediation Institute',
            issueDate: new Date('2021-06-10'),
            credentialId: 'IMI-AMT-2021-045'
          }
        ],
        experience: [
          {
            id: 'exp-1',
            organization: 'Johnson Mediation Services',
            position: 'Senior Mediator',
            startDate: new Date('2020-01-01'),
            description: 'Leading mediation services for business and freelance disputes',
            isCurrent: true
          },
          {
            id: 'exp-2',
            organization: 'Legal Solutions Inc.',
            position: 'Mediation Specialist',
            startDate: new Date('2018-06-01'),
            endDate: new Date('2019-12-31'),
            description: 'Specialized in contract and payment dispute resolution',
            isCurrent: false
          }
        ],
        preferences: {
          preferredDisputeTypes: ['contract_dispute', 'payment_dispute'],
          preferredDisputeSizes: ['medium', 'large'],
          maxDisputeAmount: 50000,
          minDisputeAmount: 1000,
          autoAcceptAssignments: false
        },
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'mediator-2',
        userId: 'user-6',
        name: 'Prof. David Lee',
        email: 'david@example.com',
        phone: '+1-555-0456',
        bio: 'Senior mediator with expertise in complex business disputes and technical project conflicts.',
        profileImage: '/avatars/david.jpg',
        expertiseAreas: [
          {
            id: 'exp-3',
            category: 'quality_dispute',
            subcategories: ['deliverables', 'standards', 'revision'],
            experienceLevel: 'expert',
            yearsOfExperience: 12,
            caseCount: 203,
            successRate: 93.1
          }
        ],
        languages: ['English', 'Mandarin', 'Japanese'],
        availability: {
          timezone: 'PST',
          workingHours: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
            { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
            { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
            { dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
            { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isAvailable: true },
            { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: true },
            { dayOfWeek: 0, startTime: '09:00', endTime: '13:00', isAvailable: false }
          ],
          maxConcurrentMediations: 3,
          responseTime: 4
        },
        rating: 4.9,
        totalMediations: 203,
        successfulMediations: 189,
        averageResolutionTime: 3.8,
        hourlyRate: 200,
        currency: 'USD',
        isActive: true,
        isVerified: true,
        verificationDocuments: [
          {
            id: 'doc-3',
            type: 'certification',
            name: 'Professional Mediator Certification',
            fileUrl: '/documents/david-cert.pdf',
            status: 'approved',
            uploadedAt: new Date('2022-05-10')
          }
        ],
        specializations: ['Quality Assurance', 'Project Management', 'Technical Disputes', 'Software Development'],
        certifications: [
          {
            id: 'cert-3',
            name: 'Professional Mediator',
            issuingOrganization: 'Mediation Society of America',
            issueDate: new Date('2019-09-01'),
            credentialId: 'MSA-PM-2019-123'
          }
        ],
        experience: [
          {
            id: 'exp-3',
            organization: 'TechMediation Solutions',
            position: 'Principal Mediator',
            startDate: new Date('2019-01-01'),
            description: 'Leading mediation for technology and software development disputes',
            isCurrent: true
          }
        ],
        preferences: {
          preferredDisputeTypes: ['quality_dispute', 'scope_dispute'],
          preferredDisputeSizes: ['large', 'enterprise'],
          maxDisputeAmount: 100000,
          minDisputeAmount: 5000,
          autoAcceptAssignments: true
        },
        createdAt: new Date('2019-01-01'),
        updatedAt: new Date('2024-01-10')
      }
    ];

    setMediators(mockMediators);
  }, []);

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (!isVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactive';
    if (!isVerified) return 'Pending Verification';
    return 'Active & Verified';
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMediators = mediators.filter(mediator => {
    const matchesSearch = mediator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mediator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mediator.specializations.some(spec => 
                           spec.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && mediator.isActive && mediator.isVerified) ||
                         (statusFilter === 'inactive' && !mediator.isActive) ||
                         (statusFilter === 'pending' && mediator.isActive && !mediator.isVerified);
    const matchesExpertise = expertiseFilter === 'all' || 
                            mediator.expertiseAreas.some(area => area.category === expertiseFilter);
    return matchesSearch && matchesStatus && matchesExpertise;
  });

  const renderMediatorCard = (mediator: Mediator) => (
    <Card key={mediator.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {mediator.profileImage ? (
                <img 
                  src={mediator.profileImage} 
                  alt={mediator.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <Users className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{mediator.name}</CardTitle>
              <p className="text-sm text-gray-600">{mediator.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(mediator.isActive, mediator.isVerified)}>
              {getStatusText(mediator.isActive, mediator.isVerified)}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{mediator.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Total Mediations:</span> {mediator.totalMediations}
            </div>
            <div className="text-sm">
              <span className="font-medium">Success Rate:</span> {
                Math.round((mediator.successfulMediations / mediator.totalMediations) * 100)
              }%
            </div>
            <div className="text-sm">
              <span className="font-medium">Avg. Resolution Time:</span> {mediator.averageResolutionTime}h
            </div>
            <div className="text-sm">
              <span className="font-medium">Hourly Rate:</span> ${mediator.hourlyRate}/{mediator.currency}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Languages:</span> {mediator.languages.join(', ')}
            </div>
            <div className="text-sm">
              <span className="font-medium">Specializations:</span> {mediator.specializations.slice(0, 2).join(', ')}
              {mediator.specializations.length > 2 && ` +${mediator.specializations.length - 2} more`}
            </div>
            <div className="text-sm">
              <span className="font-medium">Max Concurrent:</span> {mediator.availability.maxConcurrentMediations}
            </div>
            <div className="text-sm">
              <span className="font-medium">Response Time:</span> {mediator.availability.responseTime}h
            </div>
          </div>
        </div>
        
        {mediator.bio && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 line-clamp-2">{mediator.bio}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedMediator(mediator)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedMediator(mediator);
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderMediatorDetails = () => {
    if (!selectedMediator) return null;

    return (
      <Dialog open={!!selectedMediator} onOpenChange={() => setSelectedMediator(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedMediator.name} - Mediator Profile
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="expertise">Expertise</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedMediator.email}</span>
                    </div>
                    {selectedMediator.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedMediator.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedMediator.availability.timezone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{selectedMediator.rating}/5.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Mediations:</span>
                      <span className="text-sm font-medium">{selectedMediator.totalMediations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate:</span>
                      <span className="text-sm font-medium">
                        {Math.round((selectedMediator.successfulMediations / selectedMediator.totalMediations) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Resolution Time:</span>
                      <span className="text-sm font-medium">{selectedMediator.averageResolutionTime}h</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedMediator.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{selectedMediator.bio}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedMediator.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expertise" className="space-y-4">
              <div className="space-y-4">
                {selectedMediator.expertiseAreas.map((area) => (
                  <Card key={area.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg capitalize">
                          {area.category.replace('_', ' ')}
                        </CardTitle>
                        <Badge className={getExperienceLevelColor(area.experienceLevel)}>
                          {area.experienceLevel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm font-medium">Experience:</span>
                          <p className="text-sm text-gray-600">{area.yearsOfExperience} years</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Cases:</span>
                          <p className="text-sm text-gray-600">{area.caseCount}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Success Rate:</span>
                          <p className="text-sm text-gray-600">{area.successRate}%</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Subcategories:</span>
                          <p className="text-sm text-gray-600">{area.subcategories.length}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Subcategories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {area.subcategories.map((sub, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {sub.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Working Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedMediator.availability.workingHours.map((schedule, index) => {
                      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{dayNames[schedule.dayOfWeek]}</span>
                          <div className="flex items-center gap-2">
                            {schedule.isAvailable ? (
                              <>
                                <span className="text-sm">{schedule.startTime} - {schedule.endTime}</span>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </>
                            ) : (
                              <>
                                <span className="text-sm text-gray-500">Not available</span>
                                <XCircle className="h-4 w-4 text-red-500" />
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Capacity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Max Concurrent Mediations:</span>
                      <span className="text-sm font-medium">{selectedMediator.availability.maxConcurrentMediations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time:</span>
                      <span className="text-sm font-medium">{selectedMediator.availability.responseTime} hours</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Auto Accept:</span>
                      <span className="text-sm font-medium">
                        {selectedMediator.preferences.autoAcceptAssignments ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Min Dispute Amount:</span>
                      <span className="text-sm font-medium">${selectedMediator.preferences.minDisputeAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Max Dispute Amount:</span>
                      <span className="text-sm font-medium">${selectedMediator.preferences.maxDisputeAmount}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Verification Documents</h3>
                  <div className="space-y-2">
                    {selectedMediator.verificationDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded">
                            <Upload className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {doc.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Certifications</h3>
                  <div className="space-y-2">
                    {selectedMediator.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded">
                            <Award className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-gray-500">{cert.issuingOrganization}</p>
                            <p className="text-sm text-gray-500">
                              Issued: {new Date(cert.issueDate).toLocaleDateString()}
                              {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {cert.credentialId}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mediator Management</h2>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Mediator
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search mediators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active & Verified</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending Verification</SelectItem>
          </SelectContent>
        </Select>
        <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Expertise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expertise</SelectItem>
            <SelectItem value="contract_dispute">Contract Disputes</SelectItem>
            <SelectItem value="payment_dispute">Payment Disputes</SelectItem>
            <SelectItem value="quality_dispute">Quality Disputes</SelectItem>
            <SelectItem value="scope_dispute">Scope Disputes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredMediators.map(renderMediatorCard)}
      </div>

      {renderMediatorDetails()}

      {/* Create Mediator Dialog - Placeholder */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Mediator</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Mediator creation form will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Mediator Dialog - Placeholder */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Mediator</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Mediator edit form will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediatorManagement;
