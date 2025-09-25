'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DisputeReasonSelector } from './DisputeReasonSelector';
import { ProjectSelector } from './ProjectSelector';
import { Upload, Paperclip } from 'lucide-react';
import { TIMEOUTS, VALIDATION_LIMITS } from '@/constants/magic-numbers';

interface DisputeFormData {
  reason: string;
  projectId: string;
  description: string;
  evidence?: File[];
}

interface DisputeCreationFormProps {
  onSubmit: (data: DisputeFormData) => void;
}

export function DisputeCreationForm({ onSubmit }: DisputeCreationFormProps) {
  const [formData, setFormData] = useState<DisputeFormData>({
    reason: '',
    projectId: '',
    description: '',
    evidence: []
  });
  const [errors, setErrors] = useState<Partial<DisputeFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<DisputeFormData> = {};

    if (!formData.reason) {
      newErrors.reason = 'Please select a reason for the dispute';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description of the dispute';
    } else if (formData.description.trim().length < VALIDATION_LIMITS.MIN_MESSAGE_LENGTH) {
      newErrors.description = `Description must be at least ${VALIDATION_LIMITS.MIN_MESSAGE_LENGTH} characters long`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.API_DELAY_VERY_LONG));
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting dispute:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      evidence: [...(prev.evidence || []), ...files]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Reason for dispute */}
      <div className='space-y-2'>
        <label className='text-sm font-medium text-gray-700'>
          Reason for dispute
        </label>
        <DisputeReasonSelector
          value={formData.reason}
          onChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
          error={errors.reason}
        />
      </div>

      {/* Which client do you have dispute with */}
      <div className='space-y-2'>
        <label className='text-sm font-medium text-gray-700'>
          Which client do you have dispute with?
        </label>
        <ProjectSelector
          value={formData.projectId}
          onChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
          error={errors.projectId}
        />
      </div>

      {/* Dispute description */}
      <div className='space-y-2'>
        <label className='text-sm font-medium text-gray-700'>
          Dispute description
        </label>
        <Textarea
          placeholder='Enter a full description of the dispute'
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={`min-h-[120px] resize-none ${errors.description ? 'border-red-500' : ''}`}
        />
        {errors.description && (
          <p className='text-sm text-red-500'>{errors.description}</p>
        )}
      </div>

      {/* Upload evidence */}
      <div className='space-y-2'>
        <label className='text-sm font-medium text-gray-700'>
          Upload evidence (Optional)
        </label>
        <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors'>
          <div className='flex flex-col items-center gap-2'>
            <Upload className='h-8 w-8 text-gray-400' />
            <div className='text-gray-600'>
              <span className='font-medium'>Drag your file(s) or </span>
              <label className='text-blue-600 hover:text-blue-700 cursor-pointer underline'>
                browse
                <input
                  type='file'
                  multiple
                  accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                  onChange={handleFileUpload}
                  className='hidden'
                />
              </label>
            </div>
            <p className='text-sm text-gray-500'>Max 10 MB files are allowed</p>
          </div>
        </div>
        
        {/* Display uploaded files */}
        {formData.evidence && formData.evidence.length > 0 && (
          <div className='space-y-2'>
            {formData.evidence.map((file, index) => (
              <div key={index} className='flex items-center gap-2 p-2 bg-gray-50 rounded'>
                <Paperclip className='h-4 w-4 text-gray-500' />
                <span className='text-sm text-gray-700'>{file.name}</span>
                <span className='text-xs text-gray-500'>
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <Button
        type='submit'
        disabled={isSubmitting}
        className='w-full bg-[#1e293b] hover:bg-[#334155] text-white py-3 rounded-lg font-medium'
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}