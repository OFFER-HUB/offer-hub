'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skill } from '@/lib/mockData/freelancer-profile-mock';

interface SkillsSectionProps {
  skills: Skill[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'expert':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'beginner':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProficiencyPercentage = (proficiency: string) => {
    switch (proficiency) {
      case 'expert':
        return 100;
      case 'advanced':
        return 85;
      case 'intermediate':
        return 65;
      case 'beginner':
        return 40;
      default:
        return 50;
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-6'>Skills</h2>
      
      <div className='space-y-6'>
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category} className='space-y-3'>
            <h3 className='text-lg font-medium text-gray-800'>{category}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {categorySkills.map((skill) => (
                <div key={skill.name} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-700'>
                      {skill.name}
                    </span>
                    <Badge 
                      variant='outline' 
                      className={`text-xs ${getProficiencyColor(skill.proficiency)}`}
                    >
                      {skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1)}
                    </Badge>
                  </div>
                  <Progress 
                    value={getProficiencyPercentage(skill.proficiency)} 
                    className='h-2'
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Skills Tags */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <h3 className='text-lg font-medium text-gray-800 mb-3'>All Skills</h3>
        <div className='flex flex-wrap gap-2'>
          {skills.map((skill) => (
            <Badge 
              key={skill.name}
              variant='outline' 
              className={`${getProficiencyColor(skill.proficiency)}`}
            >
              {skill.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
