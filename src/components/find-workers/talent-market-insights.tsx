'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Users, DollarSign, Clock, BarChart2 } from 'lucide-react'

export default function TalentMarketInsights() {
  return (
    <Card>
      <CardContent className='p-6'>
        <Tabs defaultValue='rates'>
          <TabsList className='grid grid-cols-4 mb-6'>
            <TabsTrigger value='rates'>Hourly Rates</TabsTrigger>
            <TabsTrigger value='skills'>In-Demand Skills</TabsTrigger>
            <TabsTrigger value='availability'>Availability</TabsTrigger>
            <TabsTrigger value='trends'>Market Trends</TabsTrigger>
          </TabsList>

          <TabsContent value='rates' className='mt-0'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2'>
                <div className='h-[300px] flex items-center justify-center bg-gray-50 rounded-lg'>
                  <div className='text-center'>
                    <BarChart2 className='h-10 w-10 text-[#15949C] mx-auto mb-2' />
                    <p className='text-[#002333]/70'>Hourly Rate Distribution Chart</p>
                    <p className='text-sm text-[#002333]/50'>
                      In a real implementation, this would show a bar chart of hourly rates
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-medium text-[#002333] mb-4'>Rate Insights</h3>
                <div className='space-y-4'>
                  <div className='flex items-start'>
                    <div className='h-10 w-10 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                      <DollarSign className='h-5 w-5 text-[#15949C]' />
                    </div>
                    <div>
                      <p className='font-medium text-[#002333]'>Average Rate</p>
                      <p className='text-2xl font-bold text-[#002333]'>$55/hr</p>
                      <p className='text-sm text-green-600 flex items-center'>
                        <TrendingUp className='h-3 w-3 mr-1' />
                        <span>+5% from last quarter</span>
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start'>
                    <div className='h-10 w-10 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                      <Users className='h-5 w-5 text-[#15949C]' />
                    </div>
                    <div>
                      <p className='font-medium text-[#002333]'>Rate by Experience</p>
                      <div className='space-y-1 mt-1'>
                        <p className='text-sm text-[#002333]'>Entry Level: $25-40/hr</p>
                        <p className='text-sm text-[#002333]'>Intermediate: $40-70/hr</p>
                        <p className='text-sm text-[#002333]'>Expert: $70-120/hr</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='skills' className='mt-0'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2'>
                <div className='h-[300px] flex items-center justify-center bg-gray-50 rounded-lg'>
                  <div className='text-center'>
                    <BarChart2 className='h-10 w-10 text-[#15949C] mx-auto mb-2' />
                    <p className='text-[#002333]/70'>Top Skills Demand Chart</p>
                    <p className='text-sm text-[#002333]/50'>
                      In a real implementation, this would show a chart of most in-demand skills
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-medium text-[#002333] mb-4'>Skill Insights</h3>
                <div className='space-y-4'>
                  <div>
                    <p className='font-medium text-[#002333] mb-2'>Top 5 In-Demand Skills</p>
                    <ol className='space-y-2'>
                      <li className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                        <span className='text-[#002333]'>1. React</span>
                        <span className='text-sm text-green-600'>+15%</span>
                      </li>
                      <li className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                        <span className='text-[#002333]'>2. TypeScript</span>
                        <span className='text-sm text-green-600'>+12%</span>
                      </li>
                      <li className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                        <span className='text-[#002333]'>3. UI/UX Design</span>
                        <span className='text-sm text-green-600'>+10%</span>
                      </li>
                      <li className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                        <span className='text-[#002333]'>4. Node.js</span>
                        <span className='text-sm text-green-600'>+8%</span>
                      </li>
                      <li className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                        <span className='text-[#002333]'>5. Python</span>
                        <span className='text-sm text-green-600'>+7%</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='availability' className='mt-0'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2'>
                <div className='h-[300px] flex items-center justify-center bg-gray-50 rounded-lg'>
                  <div className='text-center'>
                    <BarChart2 className='h-10 w-10 text-[#15949C] mx-auto mb-2' />
                    <p className='text-[#002333]/70'>Freelancer Availability Chart</p>
                    <p className='text-sm text-[#002333]/50'>
                      In a real implementation, this would show a chart of freelancer availability
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-medium text-[#002333] mb-4'>Availability Insights</h3>
                <div className='space-y-4'>
                  <div className='flex items-start'>
                    <div className='h-10 w-10 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                      <Clock className='h-5 w-5 text-[#15949C]' />
                    </div>
                    <div>
                      <p className='font-medium text-[#002333]'>Availability Distribution</p>
                      <div className='space-y-1 mt-1'>
                        <p className='text-sm text-[#002333]'>Full-time (40+ hrs/week): 45%</p>
                        <p className='text-sm text-[#002333]'>Part-time (20-30 hrs/week): 35%</p>
                        <p className='text-sm text-[#002333]'>Hourly (as needed): 20%</p>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-start'>
                    <div className='h-10 w-10 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                      <Users className='h-5 w-5 text-[#15949C]' />
                    </div>
                    <div>
                      <p className='font-medium text-[#002333]'>Response Time</p>
                      <div className='space-y-1 mt-1'>
                        <p className='text-sm text-[#002333]'>Within 1 hour: 35%</p>
                        <p className='text-sm text-[#002333]'>Within 4 hours: 45%</p>
                        <p className='text-sm text-[#002333]'>Within 24 hours: 20%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='trends' className='mt-0'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2'>
                <div className='h-[300px] flex items-center justify-center bg-gray-50 rounded-lg'>
                  <div className='text-center'>
                    <BarChart2 className='h-10 w-10 text-[#15949C] mx-auto mb-2' />
                    <p className='text-[#002333]/70'>Market Trends Chart</p>
                    <p className='text-sm text-[#002333]/50'>
                      In a real implementation, this would show a chart of freelancer market trends
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-medium text-[#002333] mb-4'>Trend Insights</h3>
                <div className='space-y-4'>
                  <div className='flex items-start'>
                    <div className='h-10 w-10 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                      <TrendingUp className='h-5 w-5 text-[#15949C]' />
                    </div>
                    <div>
                      <p className='font-medium text-[#002333]'>Growing Categories</p>
                      <div className='space-y-1 mt-1'>
                        <p className='text-sm text-[#002333]'>AI & Machine Learning: +25%</p>
                        <p className='text-sm text-[#002333]'>Mobile Development: +18%</p>
                        <p className='text-sm text-[#002333]'>Data Science: +15%</p>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-start'>
                    <div className='h-10 w-10 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                      <DollarSign className='h-5 w-5 text-[#15949C]' />
                    </div>
                    <div>
                      <p className='font-medium text-[#002333]'>Pricing Trends</p>
                      <div className='space-y-1 mt-1'>
                        <p className='text-sm text-[#002333]'>Overall rates: +7% YoY</p>
                        <p className='text-sm text-[#002333]'>Specialized skills: +12% YoY</p>
                        <p className='text-sm text-[#002333]'>Entry-level: +4% YoY</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

