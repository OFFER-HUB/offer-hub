'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  Users, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Play,
  Pause,
  Square,
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Video,
  Phone,
  MapPin,
  Globe,
  Star,
  Award,
  Scale,
  Send,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  MoreVertical
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
    joinedAt?: Date;
    leftAt?: Date;
    permissions: {
      canSpeak: boolean;
      canSubmitEvidence: boolean;
      canViewEvidence: boolean;
      canProposeSettlement: boolean;
      canVoteOnProposals: boolean;
      canAccessRecording: boolean;
    };
  }>;
  agenda: Array<{
    id: string;
    title: string;
    description: string;
    duration: number;
    order: number;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    notes?: string;
  }>;
  notes: Array<{
    id: string;
    authorId: string;
    content: string;
    isPrivate: boolean;
    category: 'general' | 'evidence' | 'proposal' | 'outcome' | 'action_item';
    tags: string[];
    createdAt: Date;
  }>;
  evidence: Array<{
    id: string;
    submittedBy: string;
    title: string;
    description: string;
    type: 'document' | 'image' | 'video' | 'audio' | 'screenshot' | 'email' | 'message' | 'contract' | 'invoice' | 'other';
    fileUrl?: string;
    fileSize?: number;
    fileType?: string;
    isAccepted: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
    submittedAt: Date;
  }>;
  proposals: Array<{
    id: string;
    proposedBy: string;
    title: string;
    description: string;
    status: 'draft' | 'submitted' | 'under_review' | 'voting' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
    votes: Array<{
      participantId: string;
      vote: 'accept' | 'reject' | 'abstain';
      comments?: string;
      votedAt: Date;
    }>;
    deadline: Date;
    isAccepted: boolean;
    createdAt: Date;
  }>;
  outcome?: 'settled' | 'partially_settled' | 'not_settled' | 'escalated' | 'cancelled';
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MediationWorkflow: React.FC = () => {
  const [session, setSession] = useState<MediationSession | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [newEvidence, setNewEvidence] = useState({
    title: '',
    description: '',
    type: 'document' as const
  });
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockSession: MediationSession = {
      id: 'session-1',
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
          isPresent: true,
          joinedAt: new Date('2024-01-20T10:05:00Z'),
          permissions: {
            canSpeak: true,
            canSubmitEvidence: true,
            canViewEvidence: true,
            canProposeSettlement: true,
            canVoteOnProposals: true,
            canAccessRecording: true
          }
        },
        {
          id: 'p2',
          userId: 'user-2',
          role: 'freelancer',
          name: 'Jane Smith',
          email: 'jane@example.com',
          isPresent: true,
          joinedAt: new Date('2024-01-20T10:05:00Z'),
          permissions: {
            canSpeak: true,
            canSubmitEvidence: true,
            canViewEvidence: true,
            canProposeSettlement: true,
            canVoteOnProposals: true,
            canAccessRecording: true
          }
        },
        {
          id: 'p3',
          userId: 'user-3',
          role: 'mediator',
          name: 'Dr. Sarah Johnson',
          email: 'sarah@example.com',
          isPresent: true,
          joinedAt: new Date('2024-01-20T10:00:00Z'),
          permissions: {
            canSpeak: true,
            canSubmitEvidence: true,
            canViewEvidence: true,
            canProposeSettlement: true,
            canVoteOnProposals: true,
            canAccessRecording: true
          }
        }
      ],
      agenda: [
        {
          id: 'agenda-1',
          title: 'Opening Statements',
          description: 'Each party presents their initial position',
          duration: 15,
          order: 1,
          status: 'completed',
          startedAt: new Date('2024-01-20T10:05:00Z'),
          completedAt: new Date('2024-01-20T10:20:00Z'),
          notes: 'Both parties presented clear positions'
        },
        {
          id: 'agenda-2',
          title: 'Evidence Review',
          description: 'Review submitted evidence and documentation',
          duration: 30,
          order: 2,
          status: 'in_progress',
          startedAt: new Date('2024-01-20T10:20:00Z'),
          notes: 'Currently reviewing contract terms'
        },
        {
          id: 'agenda-3',
          title: 'Negotiation',
          description: 'Facilitate settlement discussions',
          duration: 45,
          order: 3,
          status: 'pending'
        },
        {
          id: 'agenda-4',
          title: 'Resolution',
          description: 'Finalize settlement agreement',
          duration: 15,
          order: 4,
          status: 'pending'
        }
      ],
      notes: [
        {
          id: 'note-1',
          authorId: 'user-3',
          content: 'Client concerned about project timeline delays',
          isPrivate: false,
          category: 'general',
          tags: ['timeline', 'client_concern'],
          createdAt: new Date('2024-01-20T10:15:00Z')
        },
        {
          id: 'note-2',
          authorId: 'user-3',
          content: 'Freelancer claims scope was expanded without compensation',
          isPrivate: false,
          category: 'general',
          tags: ['scope', 'compensation'],
          createdAt: new Date('2024-01-20T10:18:00Z')
        }
      ],
      evidence: [
        {
          id: 'evidence-1',
          submittedBy: 'user-1',
          title: 'Original Contract',
          description: 'Signed contract with original terms',
          type: 'contract',
          fileUrl: '/documents/contract.pdf',
          fileSize: 245760,
          fileType: 'application/pdf',
          isAccepted: true,
          reviewedBy: 'user-3',
          reviewedAt: new Date('2024-01-20T10:10:00Z'),
          submittedAt: new Date('2024-01-20T09:30:00Z')
        },
        {
          id: 'evidence-2',
          submittedBy: 'user-2',
          title: 'Email Correspondence',
          description: 'Email chain showing scope changes',
          type: 'email',
          fileUrl: '/documents/emails.pdf',
          fileSize: 128000,
          fileType: 'application/pdf',
          isAccepted: true,
          reviewedBy: 'user-3',
          reviewedAt: new Date('2024-01-20T10:12:00Z'),
          submittedAt: new Date('2024-01-20T09:45:00Z')
        }
      ],
      proposals: [
        {
          id: 'proposal-1',
          proposedBy: 'user-3',
          title: 'Timeline Extension Proposal',
          description: 'Extend project deadline by 2 weeks with additional compensation',
          status: 'voting',
          votes: [
            {
              participantId: 'user-1',
              vote: 'accept',
              comments: 'Acceptable if quality is maintained',
              votedAt: new Date('2024-01-20T10:25:00Z')
            }
          ],
          deadline: new Date('2024-01-20T11:00:00Z'),
          isAccepted: false,
          createdAt: new Date('2024-01-20T10:20:00Z')
        }
      ],
      followUpRequired: false,
      createdAt: new Date('2024-01-19T14:30:00Z'),
      updatedAt: new Date('2024-01-20T10:25:00Z')
    };

    setSession(mockSession);
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

  const getAgendaStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'image': return <Camera className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'email': return <MessageSquare className="h-4 w-4" />;
      case 'contract': return <Scale className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateProgress = () => {
    if (!session) return 0;
    const completed = session.agenda.filter(item => item.status === 'completed').length;
    return (completed / session.agenda.length) * 100;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Session Status and Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Mediation Session {session?.id}</CardTitle>
              <p className="text-sm text-gray-600">Dispute: {session?.disputeId}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(session?.status || '')}>
                {session?.status?.replace('_', ' ')}
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
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {session?.scheduledAt ? 
                    new Date(session.scheduledAt).toLocaleDateString() : 
                    'Not scheduled'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  {session?.duration ? formatDuration(session.duration) : 'Ongoing'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{session?.participants.length} participants</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Type:</span> {session?.type}
              </div>
              <div className="text-sm">
                <span className="font-medium">Meeting:</span> {session?.meetingType.replace('_', ' ')}
              </div>
              {session?.location && (
                <div className="text-sm">
                  <span className="font-medium">Location:</span> {session.location}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Mediator:</span> Dr. Sarah Johnson
              </div>
              <div className="text-sm">
                <span className="font-medium">Progress:</span> {Math.round(calculateProgress())}%
              </div>
              <Progress value={calculateProgress()} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {session?.participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-gray-500">{participant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {participant.role}
                  </Badge>
                  {participant.isPresent ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">Offline</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meeting Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={isMicOn ? "default" : "outline"}
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={isVideoOn ? "default" : "outline"}
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            <Button variant="outline">
              <Share className="h-4 w-4" />
              Share Screen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgendaTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Session Agenda</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {session?.agenda.map((item, index) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {item.order}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getAgendaStatusColor(item.status)}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-gray-500">{item.duration} min</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.notes && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {item.notes}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                {item.status === 'pending' && (
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                )}
                {item.status === 'in_progress' && (
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEvidenceTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Evidence</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Evidence
        </Button>
      </div>

      <div className="space-y-4">
        {session?.evidence.map((evidence) => (
          <Card key={evidence.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    {getEvidenceTypeIcon(evidence.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{evidence.title}</CardTitle>
                    <p className="text-sm text-gray-600">{evidence.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={evidence.isAccepted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {evidence.isAccepted ? 'Accepted' : 'Pending'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm">
                  <span className="font-medium">Submitted by:</span> {evidence.submittedBy}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Type:</span> {evidence.type}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Size:</span> {evidence.fileSize ? `${Math.round(evidence.fileSize / 1024)} KB` : 'N/A'}
                </div>
              </div>
              {evidence.reviewNotes && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Review Notes:</span> {evidence.reviewNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProposalsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Settlement Proposals</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Proposal
        </Button>
      </div>

      <div className="space-y-4">
        {session?.proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{proposal.title}</CardTitle>
                  <p className="text-sm text-gray-600">{proposal.description}</p>
                </div>
                <Badge className={getStatusColor(proposal.status)}>
                  {proposal.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Proposed by:</span> {proposal.proposedBy}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Deadline:</span> {new Date(proposal.deadline).toLocaleString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Votes:</span> {proposal.votes.length} votes
                </div>
                
                {proposal.votes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Voting Results:</span>
                    {proposal.votes.map((vote, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{vote.participantId}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            vote.vote === 'accept' ? 'bg-green-100 text-green-800' :
                            vote.vote === 'reject' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {vote.vote}
                          </Badge>
                          {vote.comments && (
                            <span className="text-sm text-gray-600">"{vote.comments}"</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Vote Accept
                  </Button>
                  <Button variant="outline" size="sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    Vote Reject
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Session Notes</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="space-y-4">
        {session?.notes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg capitalize">{note.category.replace('_', ' ')}</CardTitle>
                  <p className="text-sm text-gray-600">
                    By {note.authorId} • {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {note.category}
                  </Badge>
                  {note.isPrivate && (
                    <Badge variant="outline" className="text-orange-600">
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-3">{note.content}</p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading mediation session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mediation Workflow</h1>
          <p className="text-gray-600">Session {session.id} - {session.disputeId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Pause className="h-4 w-4 mr-2" />
            Pause Session
          </Button>
          <Button>
            <CheckCircle className="h-4 w-4 mr-2" />
            End Session
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="agenda">
          {renderAgendaTab()}
        </TabsContent>

        <TabsContent value="evidence">
          {renderEvidenceTab()}
        </TabsContent>

        <TabsContent value="proposals">
          {renderProposalsTab()}
        </TabsContent>

        <TabsContent value="notes">
          {renderNotesTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediationWorkflow;
