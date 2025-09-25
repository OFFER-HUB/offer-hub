import { useState } from 'react'
import { VALIDATION_LIMITS } from '@/constants/magic-numbers';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SkillsSelectorProps {
  addedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function SkillsSelector({ addedSkills, onSkillsChange }: SkillsSelectorProps) {
  const [skillSearch, setSkillSearch] = useState('');

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !addedSkills.includes(skill.trim()) && addedSkills.length < VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT) {
      onSkillsChange([...addedSkills, skill.trim()]);
      setSkillSearch('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onSkillsChange(addedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(skillSearch);
    }
  };

  return (
    <div className='space-y-4'>
      {/* Skills Search */}
      <div className='space-y-2'>
        <label htmlFor='skillSearch' className='text-sm font-medium text-gray-700'>
          Skill required for project
        </label>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            id='skillSearch'
            type='text'
            placeholder={`Search and add up to ${VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT} skills`}
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className='w-full pl-10 rounded-lg border border-gray-300'
          />
        </div>
      </div>

      {/* Added Skills */}
      {addedSkills.length > 0 && (
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>
            Added skill
          </label>
          <div className='flex flex-wrap gap-2'>
            {addedSkills.map((skill, index) => (
              <div
                key={index}
                className='flex items-center gap-2 bg-gray-800 text-white px-3 py-1 rounded-full text-sm'
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className='hover:text-red-300 transition-colors text-sm font-medium'
                >
                  -
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 