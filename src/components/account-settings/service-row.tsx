import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { ConversionRates, Service } from './types';

interface ServiceRowProps {
  service: Service;
  services: Service[];
  coinImages: { [key: string]: string };
  conversionRates: ConversionRates;
  setServices: (services: Service[]) => void;
  removeService: (id: string) => void;
}

export function ServiceRow({
  service,
  services,
  coinImages,
  conversionRates,
  setServices,
  removeService,
}: ServiceRowProps) {
  const convertPrice = (
    price: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    if (fromCurrency === toCurrency) return price;
    const rate = conversionRates[fromCurrency]?.[toCurrency] || 1;
    return price * rate;
  };

  const formatPriceRange = (
    minPrice: number,
    maxPrice: number,
    currency: string
  ): string => {
    if (minPrice === maxPrice) {
      return `${minPrice.toFixed(3)} ${currency}`;
    }
    return `${minPrice.toFixed(3)} - ${maxPrice.toFixed(3)} ${currency}`;
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-4 gap-4 items-start p-4 border border-gray-200 rounded-lg'>
      <div className='space-y-2'>
        <div className='font-medium text-gray-900'>{service.title}</div>
        <div className='text-sm text-gray-600'>{service.description}</div>
        <div className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block'>
          {service.category}
        </div>
      </div>
      <div className='relative'>
        <Input
          value={formatPriceRange(
            service.min_price,
            service.max_price,
            service.currency || 'XLM'
          )}
          readOnly
          className='text-secondary-500 border-gray-200 pl-10'
        />
        <Image
          width={50}
          height={50}
          src={coinImages[service.currency || 'XLM']}
          alt={service.currency || 'XLM'}
          className='absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5'
        />
      </div>
      <Select
        defaultValue={service.currency || 'XLM'}
        onValueChange={(value: string) => {
          setServices(
            services.map((s) =>
              s.id === service.id
                ? {
                    ...s,
                    currency: value,
                    min_price: convertPrice(
                      s.min_price,
                      s.currency || 'XLM',
                      value
                    ),
                    max_price: convertPrice(
                      s.max_price,
                      s.currency || 'XLM',
                      value
                    ),
                  }
                : s
            )
          );
        }}
      >
        <SelectTrigger className='bg-gray-50 border-gray-200'>
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
        variant='outline'
        className='text-[#FF2000] border-[#FF2000] bg-red-200 hover:bg-red-400'
        onClick={() => removeService(service.id)}
      >
        Remove
      </Button>
    </div>
  );
}
