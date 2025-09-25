'use client'

import type React from 'react'
import type { Invoice, InvoiceTemplate } from '../../types/invoice.types'
import { Button } from '@/components/ui/button'
import { ModernTemplate } from './templates/modern-template'
import { ClassicTemplate } from './templates/classic-template'
import { MinimalTemplate } from './templates/minimal-template'
import { ProfessionalTemplate } from './templates/professional-template'

interface InvoiceTemplateRendererProps {
  invoice: Invoice
  template: InvoiceTemplate
  onPreview?: () => void
  onDownload?: () => void
}

export function InvoiceTemplateRenderer({
  invoice,
  template,
  onPreview,
  onDownload,
}: InvoiceTemplateRendererProps) {
  const renderTemplate = () => {
    const templateProps = { invoice, template }

    switch (template.layout) {
      case 'modern':
        return <ModernTemplate {...templateProps} />
      case 'classic':
        return <ClassicTemplate {...templateProps} />
      case 'minimal':
        return <MinimalTemplate {...templateProps} />
      case 'professional':
        return <ProfessionalTemplate {...templateProps} />
      default:
        return <ModernTemplate {...templateProps} />
    }
  }

  return (
    <div className='invoice-template w-full'>
      <div className='w-full overflow-x-auto'>{renderTemplate()}</div>
      {(onPreview || onDownload) && (
        <div className='flex flex-col sm:flex-row justify-center gap-4 mt-8 no-print px-4'>
          {onPreview && (
            <Button onClick={onPreview} variant='outline' className='w-full sm:w-auto bg-transparent'>
              Preview
            </Button>
          )}
          {onDownload && (
            <Button onClick={onDownload} className='bg-[#15949C] hover:bg-[#15949C]/90 w-full sm:w-auto'>
              Download PDF
            </Button>
          )}
        </div>
      )}
    </div>
  )
}


