'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Shield,
  Scale
} from 'lucide-react';

interface MediationSession {
  id: string;
  disputeId: string;
  mediatorId: string;
  status: 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'escalated' | 'failed';
  type: 'individual' | 'group' | 'shuttle' | 'caucus' | 'hybrid';
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  location?: string;
  meetingType: 'in_person' | 'video_call' | 'phone_call' | 'chat' | 'hybrid';
  meetingUrl?: string;
  participants: Array<{
    id: string;
    userId: string;
    role: 'client' | 'freelancer' | 'mediator' | 'observer';
    name: string;
    email: string;
    isPresent: boolean;
  }>;
  outcome?: 'settled' | 'partially_settled' | 'not_settled' | 'escalated' | 'cancelled';
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Mediator {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  expertiseAreas: Array<{
    category: string;
    subcategories: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
    yearsOfExperience: number;
  }>;
  languages: string[];
  rating: number;
  totalMediations: number;
  successfulMediations: number;
  averageResolutionTime: number;
  isActive: boolean;
  isVerified: boolean;
  specializations: string[];
}

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
    signatoryId: string;
    signatoryName: string;
    signatoryRole: 'client' | 'freelancer' | 'mediator' | 'witness';
    signedAt: Date;
  }>;
  effectiveDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MediationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sessions, setSessions] = useState<MediationSession[]>([]);
  const [mediators, setMediators] = useState<Mediator[]>([]);
  const [agreements, setAgreements] = useState<SettlementAgreement[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockSessions: MediationSession[] = [
      {
        id: '1',
        disputeId: 'dispute-1',
        mediatorId: 'mediator-1',
        status: 'in_progress',
        type: 'individual',
        scheduledAt: new Date('2024-01-20T10:00:00Z'),
        startedAt: new Date('2024-01-20T10:05:00Z'),
        meetingType: 'video_call',
        meetingUrl: 'https://meet.example.com/session-1',
        participants: [
          {
            id: 'p1',
            userId: 'user-1',
            role: 'client',
            name: 'John Doe',
            email: 'john@example.com',
            isPresent: true
          },
          {
            id: 'p2',
            userId: 'user-2',
            role: 'freelancer',
            name: 'Jane Smith',
            email: 'jane@example.com',
            isPresent: true
          },
          {
            id: 'p3',
            userId: 'user-3',
            role: 'mediator',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@example.com',
            isPresent: true
          }
        ],
        followUpRequired: false,
        createdAt: new Date('2024-01-19T14:30:00Z'),
        updatedAt: new Date('2024-01-20T10:05:00Z')
      },
      {
        id: '2',
        disputeId: 'dispute-2',
        mediatorId: 'mediator-2',
        status: 'completed',
        type: 'group',
        scheduledAt: new Date('2024-01-18T14:00:00Z'),
        startedAt: new Date('2024-01-18T14:00:00Z'),
        endedAt: new Date('2024-01-18T16:30:00Z'),
        duration: 150,
        meetingType: 'in_person',
        location: 'Conference Room A',
        participants: [
          {
            id: 'p4',
            userId: 'user-4',
            role: 'client',
            name: 'Mike Wilson',
            email: 'mike@example.com',
            isPresent: true
          },
          {
            id: 'p5',
            userId: 'user-5',
            role: 'freelancer',
            name: 'Lisa Brown',
            email: 'lisa@example.com',
            isPresent: true
          },
          {
            id: 'p6',
            userId: 'user-6',
            role: 'mediator',
            name: 'Prof. David Lee',
            email: 'david@example.com',
            isPresent: true
          }
        ],
        outcome: 'settled',
        followUpRequired: true,
        followUpDate: new Date('2024-01-25T10:00:00Z'),
        createdAt: new Date('2024-01-17T09:15:00Z'),
        updatedAt: new Date('2024-01-18T16:30:00Z')
      }
    ];

    const mockMediators: Mediator[] = [
      {
        id: 'mediator-1',
        userId: 'user-3',
        name: 'Dr. Sarah Johnson',
        email: 'sarah@example.com',
        bio: 'Experienced mediator specializing in contract disputes and payment issues.',
        expertiseAreas: [
          {
            category: 'contract_dispute',
            subcategories: ['payment', 'scope', 'timeline'],
            experienceLevel: 'expert',
            yearsOfExperience: 8
          }
        ],
        languages: ['English', 'Spanish'],
        rating: 4.8,
        totalMediations: 156,
        successfulMediations: 142,
        averageResolutionTime: 4.2,
        isActive: true,
        isVerified: true,
        specializations: ['Contract Law', 'Payment Disputes', 'Freelance Agreements']
      },
      {
        id: 'mediator-2',
        userId: 'user-6',
        name: 'Prof. David Lee',
        email: 'david@example.com',
        bio: 'Senior mediator with expertise in complex business disputes.',
        expertiseAreas: [
          {
            category: 'quality_dispute',
            subcategories: ['deliverables', 'standards', 'revision'],
            experienceLevel: 'expert',
            yearsOfExperience: 12
          }
        ],
        languages: ['English', 'Mandarin'],
        rating: 4.9,
        totalMediations: 203,
        successfulMediations: 189,
        averageResolutionTime: 3.8,
        isActive: true,
        isVerified: true,
        specializations: ['Quality Assurance', 'Project Management', 'Technical Disputes']
      }
    ];

    const mockAgreements: SettlementAgreement[] = [
      {
        id: 'agreement-1',
        mediationSessionId: '2',
        disputeId: 'dispute-2',
        title: 'Settlement Agreement - Project Deliverables',
        description: 'Resolution of quality dispute regarding website development project',
        status: 'signed',
        version: 1,
        isActive: true,
        signedBy: [
          {
            signatoryId: 'user-4',
            signatoryName: 'Mike Wilson',
            signatoryRole: 'client',
            signedAt: new Date('2024-01-18T17:00:00Z')
          },
          {
            signatoryId: 'user-5',
            signatoryName: 'Lisa Brown',
            signatoryRole: 'freelancer',
            signedAt: new Date('2024-01-18T17:15:00Z')
          }
        ],
        effectiveDate: new Date('2024-01-18T17:30:00Z'),
        createdAt: new Date('2024-01-18T16:45:00Z'),
        updatedAt: new Date('2024-01-18T17:15:00Z')
      }
    ];

    setSessions(mockSessions);
    setMediators(mockMediators);
    setAgreements(mockAgreements);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'settled': return 'bg-green-100 text-green-800';
      case 'partially_settled': return 'bg-yellow-100 text-yellow-800';
      case 'not_settled': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.disputeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesType = typeFilter === 'all' || session.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const renderSessionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mediation Sessions</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sessions..."
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
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="group">Group</SelectItem>
            <SelectItem value="shuttle">Shuttle</SelectItem>
            <SelectItem value="caucus">Caucus</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Session {session.id}</CardTitle>
                  <p className="text-sm text-gray-600">Dispute: {session.disputeId}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(session.status)}>
                    {session.status.replace('_', ' ')}
                  </Badge>
                  {session.outcome && (
                    <Badge className={getOutcomeColor(session.outcome)}>
                      {session.outcome.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {session.scheduledAt ? 
                        new Date(session.scheduledAt).toLocaleDateString() : 
                        'Not scheduled'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {session.duration ? `${session.duration} min` : 'Ongoing'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{session.participants.length} participants</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Type:</span> {session.type}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Meeting:</span> {session.meetingType.replace('_', ' ')}
                  </div>
                  {session.location && (
                    <div className="text-sm">
                      <span className="font-medium">Location:</span> {session.location}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Mediator:</span> {
                      mediators.find(m => m.id === session.mediatorId)?.name || 'Unknown'
                    }
                  </div>
                  {session.followUpRequired && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Follow-up required</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {session.status === 'scheduled' && (
                  <Button size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                )}
                {session.status === 'in_progress' && (
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMediatorsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mediators</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Mediator
        </Button>
      </div>

      <div className="grid gap-4">
        {mediators.map((mediator) => (
          <Card key={mediator.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{mediator.name}</CardTitle>
                  <p className="text-sm text-gray-600">{mediator.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={mediator.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {mediator.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {mediator.isVerified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Rating:</span> {mediator.rating}/5.0
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Total Mediations:</span> {mediator.totalMediations}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Success Rate:</span> {
                      Math.round((mediator.successfulMediations / mediator.totalMediations) * 100)
                    }%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Avg. Resolution Time:</span> {mediator.averageResolutionTime}h
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Languages:</span> {mediator.languages.join(', ')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Specializations:</span> {mediator.specializations.join(', ')}
                  </div>
                </div>
                <div className="space-y-2">
                  {mediator.bio && (
                    <div className="text-sm">
                      <span className="font-medium">Bio:</span> {mediator.bio}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAgreementsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settlement Agreements</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Agreement
        </Button>
      </div>

      <div className="grid gap-4">
        {agreements.map((agreement) => (
          <Card key={agreement.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{agreement.title}</CardTitle>
                  <p className="text-sm text-gray-600">Session: {agreement.mediationSessionId}</p>
                </div>
                <Badge className={getStatusColor(agreement.status)}>
                  {agreement.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Version:</span> {agreement.version}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Effective Date:</span> {
                      new Date(agreement.effectiveDate).toLocaleDateString()
                    }
                  </div>
                  {agreement.expiryDate && (
                    <div className="text-sm">
                      <span className="font-medium">Expiry Date:</span> {
                        new Date(agreement.expiryDate).toLocaleDateString()
                      }
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Signatures:</span> {agreement.signedBy.length}/2
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Description:</span> {agreement.description}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Agreement
                </Button>
                {agreement.status === 'pending_signatures' && (
                  <Button size="sm">
                    <Scale className="h-4 w-4 mr-2" />
                    Sign Agreement
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mediation Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold">4.2h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Mediators</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mediation System</h1>
        <p className="text-gray-600">
          Comprehensive dispute resolution through professional mediation services
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="mediators" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mediators
          </TabsTrigger>
          <TabsTrigger value="agreements" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Agreements
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          {renderSessionsTab()}
        </TabsContent>

        <TabsContent value="mediators">
          {renderMediatorsTab()}
        </TabsContent>

        <TabsContent value="agreements">
          {renderAgreementsTab()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalyticsTab()}
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Mediation Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Settings configuration will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediationSystem;
