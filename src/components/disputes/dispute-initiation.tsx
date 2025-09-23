'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  Paperclip, 
  X
} from 'lucide-react';
import {
  DisputeInitiationForm,
  DisputeType,
  DisputeCategory,
  DisputeAutomationData
} from '@/types/dispute-automation.types';
import { useDisputeAutomation } from '@/hooks/use-dispute-automation';

interface DisputeInitiationProps {
  projectId?: string;
  onDisputeCreated?: (dispute: DisputeAutomationData) => void;
  onCancel?: () => void;
}

const STEPS = ['Basic Info', 'Details', 'Files', 'Review'];

const DISPUTE_TYPES = [
  { value: 'payment_dispute', label: 'Payment Issue' },
  { value: 'quality_dispute', label: 'Quality Problem' },
  { value: 'timeline_dispute', label: 'Timeline Issue' },
  { value: 'communication_dispute', label: 'Communication' },
  { value: 'scope_dispute', label: 'Scope Issue' },
  { value: 'other', label: 'Other' },
];

export function DisputeInitiation({ projectId, onDisputeCreated, onCancel }: DisputeInitiationProps) {
  const { actions } = useDisputeAutomation();
  
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<DisputeInitiationForm>({
    projectId: projectId || '',
    disputeType: 'payment_dispute' as DisputeType,
    category: 'payment_issues' as DisputeCategory,
    description: '',
    evidence: [],
    urgency: 'medium',
    requestedResolution: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!formData.projectId) newErrors.projectId = 'Project required';
      if (!formData.disputeType) newErrors.disputeType = 'Type required';
    }
    
    if (currentStep === 1) {
      if (!formData.description.trim()) newErrors.description = 'Description required';
      if (!formData.requestedResolution.trim()) newErrors.requestedResolution = 'Resolution required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      evidence: [...prev.evidence, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    setUploading(true);
    try {
      const dispute = await actions.createDispute(formData);
      onDisputeCreated?.(dispute);
    } catch {
      alert('Failed to submit dispute');
    } finally {
      setUploading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#002333] mb-2">Project *</label>
              <Input
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                placeholder="Enter project ID"
                className={errors.projectId ? 'border-red-500' : ''}
              />
              {errors.projectId && <p className="text-sm text-red-500 mt-1">{errors.projectId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#002333] mb-2">Issue Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {DISPUTE_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer p-4 transition-all ${
                      formData.disputeType === type.value
                        ? 'ring-2 ring-[#149A9B] bg-[#e4f7f7]'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, disputeType: type.value as DisputeType }))}
                  >
                    <h4 className="font-medium text-[#002333]">{type.label}</h4>
                  </Card>
                ))}
              </div>
              {errors.disputeType && <p className="text-sm text-red-500 mt-1">{errors.disputeType}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#002333] mb-2">What happened? *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue..."
                className={`min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#002333] mb-2">What do you want? *</label>
              <Textarea
                value={formData.requestedResolution}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedResolution: e.target.value }))}
                placeholder="What resolution are you looking for?"
                className={`min-h-[80px] ${errors.requestedResolution ? 'border-red-500' : ''}`}
              />
              {errors.requestedResolution && <p className="text-sm text-red-500 mt-1">{errors.requestedResolution}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-[#002333] mb-2">Upload Files (Optional)</h3>
              <div className="border-2 border-dashed border-[#E1E4ED] rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-[#B4B9C9] mx-auto mb-2" />
                <div className="text-[#6D758F]">
                  <label className="text-[#149A9B] hover:text-[#118787] cursor-pointer underline">
                    Click to upload
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {formData.evidence.length > 0 && (
              <div>
                <h4 className="font-medium text-[#002333] mb-2">Files ({formData.evidence.length})</h4>
                {formData.evidence.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#F1F3F7] rounded-lg mb-2">
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 text-[#6D758F] mr-2" />
                      <span className="text-sm text-[#002333]">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-[#B4B9C9] hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#002333]">Review Your Dispute</h3>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div><span className="text-[#6D758F]">Project:</span> {formData.projectId}</div>
                  <div><span className="text-[#6D758F]">Type:</span> {DISPUTE_TYPES.find(t => t.value === formData.disputeType)?.label}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#002333] break-words">{formData.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Requested Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#002333] break-words">{formData.requestedResolution}</p>
              </CardContent>
            </Card>

            {formData.evidence.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Attached Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formData.evidence.map((file, index) => (
                      <div key={index} className="flex items-center">
                        <Paperclip className="h-3 w-3 text-[#B4B9C9] mr-2" />
                        <span className="text-[#002333] text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#002333] mb-2">Submit Dispute</h1>
        <p className="text-[#6D758F]">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center">
          {STEPS.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= step
                    ? 'bg-[#149A9B] text-white'
                    : 'bg-[#E1E4ED] text-[#6D758F]'
                }`}
              >
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-16 mx-2 ${
                    index < step ? 'bg-[#149A9B]' : 'bg-[#E1E4ED]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-medium text-[#002333]">{STEPS[step]}</h2>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={step === 0 ? onCancel : prevStep}
          disabled={uploading}
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        <Button
          onClick={step === STEPS.length - 1 ? handleSubmit : nextStep}
          disabled={uploading}
          className="bg-[#149A9B] hover:bg-[#118787]"
        >
          {uploading ? 'Submitting...' : step === STEPS.length - 1 ? 'Submit Dispute' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
