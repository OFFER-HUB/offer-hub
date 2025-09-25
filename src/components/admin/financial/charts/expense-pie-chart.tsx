'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface ExpenseData {
  name: string
  value: number
  color: string
}

interface ExpensePieChartProps {
  data: ExpenseData[]
  formatCurrency: (amount: number) => string
}

export function ExpensePieChart({ data, formatCurrency }: ExpensePieChartProps) {
  return (
    <div className='h-64'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie data={data} cx='50%' cy='50%' innerRadius={60} outerRadius={100} paddingAngle={5} dataKey='value'>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
