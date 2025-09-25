'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Eye,
  Star,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  ResponseDisplayProps,
  RESPONSE_STATUS_COLORS,
  RESPONSE_STATUS_LABELS
} from '@/types/review-responses.types';
import { formatDistanceToNow } from 'date-fns';

export default function ResponseDisplay({
  response,
  currentUserId,
  userRole,
  onVote,
  onEdit,
  onDelete,
  showModerationActions = false,
}: ResponseDisplayProps) {
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
    if (!onVote || isVoting) return;
    
    setIsVoting(voteType);
    try {
      await onVote(response.id, voteType);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(null);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(response);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this response?')) {
      onDelete(response.id);
    }
  };

  const getStatusBadge = () => {
    const color = RESPONSE_STATUS_COLORS[response.status];
    const label = RESPONSE_STATUS_LABELS[response.status];
    
    return (
      <Badge variant='outline' className={`text-xs ${
        color === 'green' ? 'border-green-500 text-green-700 bg-green-50' :
        color === 'yellow' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
        color === 'red' ? 'border-red-500 text-red-700 bg-red-50' :
        'border-orange-500 text-orange-700 bg-orange-50'
      }`}>
        {response.status === 'pending' && <Clock className='w-3 h-3 mr-1' />}
        {response.status === 'approved' && <CheckCircle className='w-3 h-3 mr-1' />}
        {response.status === 'rejected' && <AlertCircle className='w-3 h-3 mr-1' />}
        {response.status === 'flagged' && <AlertCircle className='w-3 h-3 mr-1' />}
        {label}
      </Badge>
    );
  };

  const getEngagementScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const canEdit = response.responder_id === currentUserId && response.status === 'pending';
  const canDelete = response.responder_id === currentUserId && response.status === 'pending';
  const canVote = response.status === 'approved' && response.responder_id !== currentUserId;
  const isModerator = userRole === 'moderator' || userRole === 'admin';

  return (
    <Card className='relative hover:shadow-md transition-shadow'>
      <CardContent className='p-6'>
        <div className='flex items-start gap-4'>
          {/* Avatar */}
          <Avatar className='w-12 h-12'>
            <AvatarImage src={response.responder.avatar} alt={response.responder.name} />
            <AvatarFallback className='text-sm font-semibold'>
              {response.responder.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {/* Content */}
          <div className='flex-1 space-y-3'>
            {/* Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h4 className='font-semibold text-gray-900'>
                  {response.responder.name}
                </h4>
                {getStatusBadge()}
              </div>
              
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-500'>
                  {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                </span>
                
                {/* Action Menu */}
                {(canEdit || canDelete || showModerationActions) && (
                  <div className='relative'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowActions(!showActions)}
                    >
                      <MoreHorizontal className='w-4 h-4' />
                    </Button>
                    
                    {showActions && (
                      <div className='absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]'>
                        <div className='py-1'>
                          {canEdit && (
                            <button
                              onClick={() => {
                                handleEdit();
                                setShowActions(false);
                              }}
                              className='w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2'
                            >
                              <Edit className='w-4 h-4' />
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => {
                                handleDelete();
                                setShowActions(false);
                              }}
                              className='w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600'
                            >
                              <Trash2 className='w-4 h-4' />
                              Delete
                            </button>
                          )}
                          {showModerationActions && isModerator && (
                            <div className='border-t border-gray-200 pt-1'>
                              <button
                                onClick={() => {
                                  // Handle moderation actions
                                  setShowActions(false);
                                }}
                                className='w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2'
                              >
                                <AlertCircle className='w-4 h-4' />
                                Moderate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Response Content */}
            <div className='prose prose-sm max-w-none'>
              <p className='text-gray-700 leading-relaxed'>
                {response.content}
              </p>
            </div>
            
            {/* Moderation Notes */}
            {response.moderation_notes && (
              <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='w-4 h-4 text-yellow-600 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-yellow-800'>Moderation Note:</p>
                    <p className='text-sm text-yellow-700'>{response.moderation_notes}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Analytics */}
            <div className='flex items-center gap-6 text-sm text-gray-500'>
              <div className='flex items-center gap-1'>
                <ThumbsUp className='w-4 h-4' />
                <span className='font-medium'>{response.analytics.helpful_votes}</span>
                <span>helpful</span>
              </div>
              <div className='flex items-center gap-1'>
                <ThumbsDown className='w-4 h-4' />
                <span className='font-medium'>{response.analytics.unhelpful_votes}</span>
                <span>not helpful</span>
              </div>
              <div className='flex items-center gap-1'>
                <Eye className='w-4 h-4' />
                <span className='font-medium'>{response.analytics.views_count}</span>
                <span>views</span>
              </div>
              <div className='flex items-center gap-1'>
                <Star className={`w-4 h-4 ${getEngagementScoreColor(response.analytics.engagement_score)}`} />
                <span className={`font-medium ${getEngagementScoreColor(response.analytics.engagement_score)}`}>
                  {response.analytics.engagement_score.toFixed(1)}
                </span>
                <span>engagement</span>
              </div>
            </div>
            
            {/* Voting Buttons */}
            {canVote && (
              <div className='flex gap-2 pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleVote('helpful')}
                  disabled={isVoting === 'helpful'}
                  className='flex items-center gap-1'
                >
                  <ThumbsUp className='w-4 h-4' />
                  {isVoting === 'helpful' ? 'Voting...' : 'Helpful'}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleVote('unhelpful')}
                  disabled={isVoting === 'unhelpful'}
                  className='flex items-center gap-1'
                >
                  <ThumbsDown className='w-4 h-4' />
                  {isVoting === 'unhelpful' ? 'Voting...' : 'Not Helpful'}
                </Button>
              </div>
            )}
            
            {/* Response to Review Info */}
            <div className='pt-2 border-t border-gray-100'>
              <div className='flex items-center gap-2 text-xs text-gray-500'>
                <MessageSquare className='w-3 h-3' />
                <span>Response to review with rating: {response.review.rating}/5</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
