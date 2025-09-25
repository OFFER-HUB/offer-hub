'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PaymentChartProps {
  timeframe: string;
}

export default function PaymentChart({ timeframe }: PaymentChartProps) {
  const [chartType, setChartType] = useState('line');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate data based on timeframe
    const generateData = () => {
      if (timeframe === 'week') {
        return [
          { name: 'Mon', earnings: 320, expenses: 120 },
          { name: 'Tue', earnings: 450, expenses: 150 },
          { name: 'Wed', earnings: 280, expenses: 90 },
          { name: 'Thu', earnings: 580, expenses: 180 },
          { name: 'Fri', earnings: 490, expenses: 160 },
          { name: 'Sat', earnings: 350, expenses: 110 },
          { name: 'Sun', earnings: 200, expenses: 70 },
        ];
      } else if (timeframe === 'month') {
        return [
          { name: 'Week 1', earnings: 1200, expenses: 450 },
          { name: 'Week 2', earnings: 1800, expenses: 520 },
          { name: 'Week 3', earnings: 1400, expenses: 480 },
          { name: 'Week 4', earnings: 2200, expenses: 650 },
        ];
      } else if (timeframe === 'quarter') {
        return [
          { name: 'Jan', earnings: 3200, expenses: 1200 },
          { name: 'Feb', earnings: 4500, expenses: 1500 },
          { name: 'Mar', earnings: 3800, expenses: 1300 },
        ];
      } else {
        return [
          { name: 'Q1', earnings: 12000, expenses: 4500 },
          { name: 'Q2', earnings: 15000, expenses: 5200 },
          { name: 'Q3', earnings: 13500, expenses: 4800 },
          { name: 'Q4', earnings: 18000, expenses: 6500 },
        ];
      }
    };

    setChartData(generateData());
  }, [timeframe]);

  return (
    <div className='h-[350px]'>
      <Tabs
        defaultValue={chartType}
        onValueChange={setChartType}
        className='mb-4'
      >
        <TabsList className='grid w-[200px] grid-cols-2'>
          <TabsTrigger value='line'>Line</TabsTrigger>
          <TabsTrigger value='bar'>Bar</TabsTrigger>
        </TabsList>
      </Tabs>

      <TabsContent value='line' className='mt-0 h-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
              }}
            />
            <Legend />
            <Line
              type='monotone'
              dataKey='earnings'
              stroke='#15949C'
              strokeWidth={2}
              activeDot={{ r: 8 }}
              animationDuration={1500}
            />
            <Line
              type='monotone'
              dataKey='expenses'
              stroke='#002333'
              strokeWidth={2}
              animationDuration={1500}
              animationBegin={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value='bar' className='mt-0 h-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
              }}
            />
            <Legend />
            <Bar
              dataKey='earnings'
              fill='#15949C'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar
              dataKey='expenses'
              fill='#002333'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={300}
            />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </div>
  );
}
