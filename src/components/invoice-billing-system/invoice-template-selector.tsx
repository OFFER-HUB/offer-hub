
import type React from 'react'
import type { InvoiceTemplate } from '@/types/invoice.types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface TemplateOption {
  template: InvoiceTemplate
  preview: string
}

interface InvoiceTemplateSelectorProps {
  selectedTemplate: InvoiceTemplate
  onTemplateSelect: (template: InvoiceTemplate) => void
}

export function InvoiceTemplateSelector({
  selectedTemplate,
  onTemplateSelect,
}: InvoiceTemplateSelectorProps) {
  const templates: TemplateOption[] = [
    {
      template: {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary design with accent colors',
        isDefault: true,
        colors: { primary: '#002333', secondary: '#15949C', accent: '#DEEFE7' },
        layout: 'modern',
        includeCompanyLogo: true,
        includePaymentTerms: true,
        includeNotes: true,
      },
      preview: '/modern-invoice-template.png',
    },
    {
      template: {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional business invoice with formal styling',
        isDefault: false,
        colors: { primary: '#002333', secondary: '#15949C', accent: '#DEEFE7' },
        layout: 'classic',
        includeCompanyLogo: false,
        includePaymentTerms: true,
        includeNotes: true,
      },
      preview: '/classic-invoice-template.png',
    },
    {
      template: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple and clean design with minimal elements',
        isDefault: false,
        colors: { primary: '#002333', secondary: '#15949C', accent: '#DEEFE7' },
        layout: 'minimal',
        includeCompanyLogo: false,
        includePaymentTerms: false,
        includeNotes: true,
      },
      preview: '/minimal-invoice-template.png',
    },
    {
      template: {
        id: 'professional',
        name: 'Professional',
        description: 'Premium design with gradient header and professional styling',
        isDefault: false,
        colors: { primary: '#002333', secondary: '#15949C', accent: '#DEEFE7' },
        layout: 'professional',
        includeCompanyLogo: true,
        includePaymentTerms: true,
        includeNotes: true,
      },
      preview: '/professional-invoice-template.png',
    },
  ]

  return (
    <div className='space-y-3'>
      {templates.map(({ template, preview }) => {
        const isSelected = selectedTemplate.id === template.id
        
        return (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected 
                ? 'ring-2 ring-[#15949C] border-[#15949C] bg-[#DEEFE7]/20' 
                : 'border-gray-200 hover:border-[#15949C]/40'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <div className='p-4'>
              <div className='flex items-start gap-3'>
                {/* Thumbnail Preview */}
                <div className='flex-shrink-0 w-12 h-16 bg-gray-100 rounded border overflow-hidden'>
                  <img
                    src={preview || '/placeholder.svg'}
                    alt={`${template.name} preview`}
                    className='w-full h-full object-cover'
                  />
                </div>
                
                {/* Template Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between mb-1'>
                    <h3 className='font-semibold text-[#002333] text-sm truncate'>
                      {template.name}
                    </h3>
                    {isSelected && (
                      <div className='flex-shrink-0 w-5 h-5 bg-[#15949C] rounded-full flex items-center justify-center'>
                        <Check className='w-3 h-3 text-white' />
                      </div>
                    )}
                  </div>
                  
                  <p className='text-xs text-[#002333]/70 leading-relaxed mb-2'>
                    {template.description}
                  </p>
                  
                  <div className='flex items-center justify-between'>
                    {template.isDefault && (
                      <Badge 
                        variant='secondary'
                        className='bg-[#DEEFE7] text-[#15949C] text-xs px-2 py-1 font-medium'
                      >
                        Default
                      </Badge>
                    )}
                    
                    {/* Feature indicators */}
                    <div className='flex gap-1 ml-auto'>
                      {template.includeCompanyLogo && (
                        <div className='w-2 h-2 bg-[#15949C] rounded-full' title='Logo included' />
                      )}
                      {template.includePaymentTerms && (
                        <div className='w-2 h-2 bg-[#15949C]/60 rounded-full' title='Payment terms included' />
                      )}
                      {template.includeNotes && (
                        <div className='w-2 h-2 bg-[#15949C]/30 rounded-full' title='Notes included' />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
      
      {/* Template features legend */}
      <div className='text-xs text-[#002333]/60 px-1'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1'>
            <div className='w-2 h-2 bg-[#15949C] rounded-full' />
            <span>Logo</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-2 h-2 bg-[#15949C]/60 rounded-full' />
            <span>Terms</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-2 h-2 bg-[#15949C]/30 rounded-full' />
            <span>Notes</span>
          </div>
        </div>
      </div>
    </div>
  )
}