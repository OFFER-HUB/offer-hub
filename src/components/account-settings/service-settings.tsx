import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import usdLogo from '../../../public/logo-usd.svg';
import eurLogo from '../../../public/logo-euro.svg';
import xlmLogo from '../../../public/logo-xlm.svg';
import { ConversionRates, Service } from './types';
import { ServiceRow } from './service-row';

interface ServiceSettingsProps {
  services: Service[];
  setServices: (services: Service[]) => void;
  newServiceTitle: string;
  setNewServiceTitle: (title: string) => void;
  newServiceDescription: string;
  setNewServiceDescription: (description: string) => void;
  newServiceCategory: string;
  setNewServiceCategory: (category: string) => void;
  newServiceMinPrice: string;
  setNewServiceMinPrice: (price: string) => void;
  newServiceMaxPrice: string;
  setNewServiceMaxPrice: (price: string) => void;
  newServiceCurrency: string;
  setNewServiceCurrency: (currency: string) => void;
  conversionRates: ConversionRates;
  apiError: string | null;
  addService: () => void;
  removeService: (id: string) => void;
  isCreating: boolean;
}

export function ServiceSettings({
  services,
  setServices,
  newServiceTitle,
  setNewServiceTitle,
  newServiceDescription,
  setNewServiceDescription,
  newServiceCategory,
  setNewServiceCategory,
  newServiceMinPrice,
  setNewServiceMinPrice,
  newServiceMaxPrice,
  setNewServiceMaxPrice,
  newServiceCurrency,
  setNewServiceCurrency,
  conversionRates,
  apiError,
  addService,
  removeService,
  isCreating,
}: ServiceSettingsProps) {
  function TabTitleComponent({ label }: { label: string }) {
    return (
      <h3 className='text-[20px] text-[#002333] font-normal mb-4'>{label}</h3>
    );
  }

  const coinImages = {
    XLM: xlmLogo.src,
    USD: usdLogo.src,
    EUR: eurLogo.src,
  };

  const categoryOptions = [
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Business' },
    { value: 'data', label: 'Data & Analytics' },
    { value: 'security', label: 'Security' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div>
      <TabTitleComponent label='My Services' />
      {apiError && <div className='text-sm text-red-500 mb-4'>{apiError}</div>}
      <div className='space-y-4'>
        {services.map((service) => (
          <ServiceRow
            services={services}
            key={service.id}
            service={service}
            coinImages={coinImages}
            conversionRates={conversionRates}
            setServices={setServices}
            removeService={removeService}
          />
        ))}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start'>
          <div className='space-y-4'>
            <Input
              placeholder='Service Title'
              value={newServiceTitle}
              onChange={(e) => setNewServiceTitle(e.target.value)}
              className='border-gray-200'
            />
            <Select
              value={newServiceCategory}
              onValueChange={setNewServiceCategory}
            >
              <SelectTrigger className='border-gray-200'>
                <SelectValue placeholder='Select Category' />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-4'>
            <Textarea
              placeholder='Service Description'
              value={newServiceDescription}
              onChange={(e) => setNewServiceDescription(e.target.value)}
              className='border-gray-200 min-h-[80px]'
            />
          </div>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-2'>
              <div className='relative'>
                <Input
                  placeholder='Min Price'
                  value={newServiceMinPrice}
                  onChange={(e) => setNewServiceMinPrice(e.target.value)}
                  className='border-gray-200 pl-10'
                  type='number'
                  step='0.001'
                  min='0'
                />
                <Image
                  width={50}
                  height={50}
                  src={
                    coinImages[newServiceCurrency as keyof typeof coinImages]
                  }
                  alt={newServiceCurrency}
                  className='absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5'
                />
              </div>
              <div className='relative'>
                <Input
                  placeholder='Max Price'
                  value={newServiceMaxPrice}
                  onChange={(e) => setNewServiceMaxPrice(e.target.value)}
                  className='border-gray-200 pl-10'
                  type='number'
                  step='0.001'
                  min='0'
                />
                <Image
                  width={50}
                  height={50}
                  src={
                    coinImages[newServiceCurrency as keyof typeof coinImages]
                  }
                  alt={newServiceCurrency}
                  className='absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Select
                value={newServiceCurrency}
                onValueChange={setNewServiceCurrency}
              >
                <SelectTrigger className='border-gray-200 flex-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='XLM'>
                    <div className='flex items-center gap-2'>
                      <Image
                        width={50}
                        height={50}
                        src={coinImages.XLM}
                        alt='XLM'
                        className='w-4 h-4'
                      />
                      XLM
                    </div>
                  </SelectItem>
                  <SelectItem value='USD'>
                    <div className='flex items-center gap-2'>
                      <Image
                        width={50}
                        height={50}
                        src={coinImages.USD}
                        alt='USD'
                        className='w-4 h-4'
                      />
                      USD
                    </div>
                  </SelectItem>
                  <SelectItem value='EUR'>
                    <div className='flex items-center gap-2'>
                      <Image
                        width={50}
                        height={50}
                        src={coinImages.EUR}
                        alt='EUR'
                        className='w-4 h-4'
                      />
                      EUR
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                className='bg-teal-700 hover:bg-teal-800 text-white'
                onClick={addService}
                disabled={
                  !newServiceTitle ||
                  !newServiceDescription ||
                  !newServiceCategory ||
                  !newServiceMinPrice ||
                  !newServiceMaxPrice ||
                  isCreating
                }
              >
                {isCreating ? 'Adding...' : 'Add service'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
