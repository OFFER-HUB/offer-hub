'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Clock,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  MessageSquare,
  User,
  TrendingUp,
  Settings,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReviewQuality } from '@/hooks/use-review-quality';
import {
  ContentModerationResult,
  ModerationStatus,
  ModerationAction,
  ModerationDecision,
  ModerationSeverity,
} from '@/types/review-quality.types';
import {
  formatQualityScore,
  getModerationStatusColor,
} from '@/utils/quality-helpers';

interface ContentModerationProps {
  className?: string;
  showTestArea?: boolean;
  onModerationDecision?: (decision: ModerationDecision) => void;
}

interface ModerationItem {
  id: string;
  reviewId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: ModerationStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  flaggedReason: string;
  createdAt: string;
  assignedTo?: string;
  moderationResult?: ContentModerationResult;
}

export default function ContentModeration({
  className = '',
  showTestArea = true,
  onModerationDecision,
}: ContentModerationProps) {
  const [activeTab, setActiveTab] = useState('queue');
  const [testContent, setTestContent] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<ModerationStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  const {
    actions,
    loading,
    errors,
  } = useReviewQuality();

  // Mock moderation queue data
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([
    {
      id: 'mod_1',
      reviewId: 'rev_1',
      content: 'This developer is absolutely terrible and wasted my time completely.',
      author: { id: 'user_1', name: 'John Smith' },
      status: 'pending',
      priority: 'high',
      flaggedReason: 'Inappropriate language detected',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'mod_2',
      reviewId: 'rev_2',
      content: 'Contact me directly at john.doe@email.com for future projects!!!',
      author: { id: 'user_2', name: 'Jane Doe' },
      status: 'flagged',
      priority: 'medium',
      flaggedReason: 'Personal information sharing',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'mod_3',
      reviewId: 'rev_3',
      content: 'Excellent work! Professional, timely, and high-quality deliverables.',
      author: { id: 'user_3', name: 'Mike Johnson' },
      status: 'approved',
      priority: 'low',
      flaggedReason: 'Routine quality check',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ]);

  const [testResult, setTestResult] = useState<ContentModerationResult | null>(null);

  const handleTestContent = async () => {
    if (!testContent.trim()) return;

    try {
      const result = await actions.moderateContent(testContent);
      setTestResult(result);
    } catch (error) {
      console.error('Failed to test content:', error);
    }
  };

  const handleModerationAction = async (
    itemId: string,
    action: ModerationAction,
    reason: string = ''
  ) => {
    try {
      const item = moderationQueue.find(i => i.id === itemId);
      if (!item) return;

      let newStatus: ModerationStatus;
      switch (action) {
        case 'approve':
          newStatus = 'approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'flag':
          newStatus = 'flagged';
          break;
        case 'escalate':
          newStatus = 'escalated';
          break;
        default:
          newStatus = 'pending';
      }

      const decision = await actions.makeDecision(item.reviewId, {
        moderatorId: 'current_user',
        action,
        reason,
        previousStatus: item.status,
        newStatus,
        confidence: 95,
        notes: reason,
      });

      setModerationQueue(prev =>
        prev.map(i =>
          i.id === itemId
            ? { ...i, status: newStatus }
            : i
        )
      );

      onModerationDecision?.(decision);
    } catch (error) {
      console.error('Failed to make moderation decision:', error);
    }
  };

  const handleBulkAction = async (action: ModerationAction) => {
    for (const itemId of selectedItems) {
      await handleModerationAction(itemId, action);
    }
    setSelectedItems([]);
  };

  const filteredQueue = moderationQueue.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  const getStatusIcon = (status: ModerationStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-orange-600" />;
      case 'escalated':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const QueuePanel = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {selectedItems.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                  >
                    Approve ({selectedItems.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('reject')}
                  >
                    Reject ({selectedItems.length})
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {moderationQueue.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-orange-600">
                  {moderationQueue.filter(i => i.status === 'flagged').length}
                </p>
              </div>
              <Flag className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {moderationQueue.filter(i => i.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {moderationQueue.filter(i => i.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Moderation Queue ({filteredQueue.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQueue.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(prev => [...prev, item.id]);
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== item.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(item.status)}
                        <span className="font-medium text-gray-900">
                          Review from {item.author.name}
                        </span>
                        <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                        <p className="text-sm text-gray-700">{item.content}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Flagged: {item.flaggedReason}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getModerationStatusColor(item.status)}`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerationAction(item.id, 'approve', 'Approved after review')}
                      disabled={loading.decisions}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerationAction(item.id, 'flag', 'Flagged for additional review')}
                      disabled={loading.decisions}
                    >
                      <Flag className="w-4 h-4" />
                      Flag
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerationAction(item.id, 'reject', 'Rejected due to policy violation')}
                      disabled={loading.decisions}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredQueue.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No items in queue</p>
                <p className="text-sm">
                  {filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'No items match the current filters'
                    : 'All content has been moderated'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TestPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Content Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Test Content
              </label>
              <Textarea
                placeholder="Enter content to test moderation rules..."
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleTestContent}
              disabled={!testContent.trim() || loading.moderation}
              className="w-full"
            >
              {loading.moderation ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Test Content
            </Button>

            {errors.moderation && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.moderation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Moderation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Assessment:</span>
                <div className="flex items-center gap-2">
                  {testResult.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Moderation Score:</span>
                <div className="flex items-center gap-2">
                  <Progress value={testResult.score} className="w-24 h-2" />
                  <span className="text-sm font-medium">{testResult.score.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Suggested Action:</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    testResult.suggestedAction === 'approve' ? 'border-green-500 text-green-700' :
                    testResult.suggestedAction === 'reject' ? 'border-red-500 text-red-700' :
                    'border-orange-500 text-orange-700'
                  }`}
                >
                  {testResult.suggestedAction}
                </Badge>
              </div>

              {testResult.flags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Flags Detected:</h4>
                  <div className="space-y-2">
                    {testResult.flags.map((flag, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                        <div>
                          <span className="text-sm font-medium text-red-800">{flag.type}</span>
                          <p className="text-xs text-red-600">{flag.description}</p>
                        </div>
                        <Badge className={`text-xs ${
                          flag.severity === 'critical' ? 'bg-red-500' :
                          flag.severity === 'high' ? 'bg-orange-500' :
                          flag.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}>
                          {flag.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResult.reasoning.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Reasoning:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {testResult.reasoning.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600">Monitor and moderate review content for quality and compliance</p>
        </div>
        <Button
          variant="outline"
          onClick={() => actions.refreshData()}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="test" disabled={!showTestArea}>
            Content Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          <QueuePanel />
        </TabsContent>

        {showTestArea && (
          <TabsContent value="test" className="space-y-6">
            <TestPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}