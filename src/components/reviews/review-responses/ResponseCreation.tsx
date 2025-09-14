'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Send, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  MessageSquare,
  Clock
} from 'lucide-react';
import { 
  ResponseCreationProps,
  RESPONSE_VALIDATION
} from '@/types/review-responses.types';
import { useResponseValidation } from '@/hooks/useReviewResponses';

export default function ResponseCreation({
  reviewId,
  onSubmit,
  onCancel,
  isLoading = false,
  guidelines,
}: ResponseCreationProps) {
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { validateContent, getQualityScore } = useResponseValidation();

  // Real-time validation
  useEffect(() => {
    if (content.trim()) {
      const validation = validateContent(content);
      setErrors(validation.errors);
      
      // Show suggestions if quality score is low
      const qualityScore = getQualityScore(content);
      setShowSuggestions(qualityScore < 70);
    } else {
      setErrors([]);
      setShowSuggestions(false);
    }
  }, [content, validateContent, getQualityScore]);

  const handleSubmit = async () => {
    const validation = validateContent(content);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(content);
    } catch (error) {
      setErrors(['Failed to submit response. Please try again.']);
    }
  };

  const getCharacterCountColor = () => {
    const length = content.length;
    if (length < RESPONSE_VALIDATION.MIN_LENGTH) return 'text-red-500';
    if (length < RESPONSE_VALIDATION.OPTIMAL_MIN_LENGTH) return 'text-yellow-500';
    if (length <= RESPONSE_VALIDATION.OPTIMAL_MAX_LENGTH) return 'text-green-500';
    if (length <= RESPONSE_VALIDATION.MAX_LENGTH) return 'text-yellow-500';
    return 'text-red-500';
  };

  const calculateQualityScore = () => {
    if (!content.trim()) return 0;
    return getQualityScore(content);
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const qualityScore = calculateQualityScore();

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold flex items-center gap-2'>
            <MessageSquare className='w-5 h-5' />
            Write Response
          </CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className='space-y-4'>
        {/* Guidelines Summary */}
        {guidelines && (
          <Alert>
            <Lightbulb className='h-4 w-4' />
            <AlertDescription className='text-sm'>
              <strong>Quick Tips:</strong> {guidelines.professional_tone}. 
              Keep responses between {guidelines.validation_rules.min_length}-{guidelines.validation_rules.max_length} characters.
            </AlertDescription>
          </Alert>
        )}

        {/* Response Textarea */}
        <div className='space-y-2'>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='Share your perspective on this review. Be professional, constructive, and specific...'
            className='min-h-[120px] resize-none'
            disabled={isLoading}
          />
          
          {/* Character Count and Quality Score */}
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-4'>
              <span className={getCharacterCountColor()}>
                {content.length}/{RESPONSE_VALIDATION.MAX_LENGTH}
              </span>
              {content.trim() && (
                <div className='flex items-center gap-1'>
                  <span className='text-gray-500'>Quality:</span>
                  <span className={getQualityColor(qualityScore)}>
                    {qualityScore}%
                  </span>
                </div>
              )}
            </div>
            
            {content.trim() && (
              <div className='flex items-center gap-1 text-gray-500'>
                <Clock className='w-4 h-4' />
                <span>
                  {content.length < RESPONSE_VALIDATION.OPTIMAL_MIN_LENGTH 
                    ? 'Too short' 
                    : content.length > RESPONSE_VALIDATION.OPTIMAL_MAX_LENGTH 
                    ? 'Too long' 
                    : 'Good length'
                  }
                </span>
              </div>
            )}
          </div>
          
          {/* Quality Progress Bar */}
          {content.trim() && (
            <Progress 
              value={qualityScore} 
              className='h-2'
            />
          )}
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <ul className='list-disc list-inside space-y-1'>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Quality Suggestions */}
        {showSuggestions && content.trim() && (
          <Alert>
            <Lightbulb className='h-4 w-4' />
            <AlertDescription>
              <div className='space-y-2'>
                <p className='font-medium'>Suggestions to improve your response:</p>
                <ul className='list-disc list-inside space-y-1 text-sm'>
                  {content.length < RESPONSE_VALIDATION.OPTIMAL_MIN_LENGTH && (
                    <li>Add more detail to make your response more helpful</li>
                  )}
                  {content.length > RESPONSE_VALIDATION.OPTIMAL_MAX_LENGTH && (
                    <li>Consider shortening your response for better readability</li>
                  )}
                  {!content.toLowerCase().includes('thank') && (
                    <li>Consider thanking the reviewer for their feedback</li>
                  )}
                  {!content.toLowerCase().includes('improve') && (
                    <li>Mention any improvements you'll make based on the feedback</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Example Responses */}
        {guidelines && !content.trim() && (
          <div className='space-y-3'>
            <h4 className='font-medium text-sm text-gray-700'>Example responses:</h4>
            
            <div className='space-y-2'>
              <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex items-start gap-2'>
                  <CheckCircle className='w-4 h-4 text-green-600 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-green-800'>Good example:</p>
                    <p className='text-sm text-green-700 italic'>"{guidelines.examples.good}"</p>
                  </div>
                </div>
              </div>
              
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='w-4 h-4 text-red-600 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-red-800'>Avoid this:</p>
                    <p className='text-sm text-red-700 italic'>"{guidelines.examples.bad}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex items-center justify-between pt-4'>
          <div className='flex items-center gap-2'>
            {content.trim() && (
              <Badge 
                variant='outline' 
                className={`text-xs ${
                  qualityScore >= 80 ? 'border-green-500 text-green-700' :
                  qualityScore >= 60 ? 'border-yellow-500 text-yellow-700' :
                  'border-red-500 text-red-700'
                }`}
              >
                {qualityScore >= 80 ? 'High Quality' :
                 qualityScore >= 60 ? 'Good Quality' :
                 'Needs Improvement'}
              </Badge>
            )}
          </div>
          
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || errors.length > 0 || !content.trim()}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Submitting...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Send className='w-4 h-4' />
                  Submit Response
                </div>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
