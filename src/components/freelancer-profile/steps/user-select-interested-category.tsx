import React, { useState } from 'react';
import Header from './header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface UserSelectInterestedCategoryProps {
  prevStep: () => void;
  nextStep: () => void;
}

const UserSelectInterestedCategory: React.FC<UserSelectInterestedCategoryProps> = ({ prevStep, nextStep }) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const maxSkills = 15;

  const handleAddSkill = (skill: string) => {
    if (selectedSkills.length < maxSkills && !selectedSkills.includes(skill) && skill.trim() !== '') {
      setSelectedSkills([...selectedSkills, skill.trim()]);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(event.target.value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && skillInput) {
      handleAddSkill(skillInput);
      setSkillInput(''); // Clear input after adding
      event.preventDefault(); // Prevent form submission if applicable
    }
  };

  // Placeholder for suggested skills - replace with actual data later
  const suggestedSkills = ['Illustration', 'Brand Development', 'UI Design', 'UX Design', 'Web Development'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Header title="Step 3/10" />
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-center mb-2">You're close! What work are you here to do?</h2>
        <p className="text-center text-muted-foreground mb-6">Don't worry you can change these choices later on.</p>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Enter skill here"
            value={skillInput}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="pl-10"
          />
        </div>

        <div className="mb-6 min-h-[50px] border rounded p-2 flex flex-wrap gap-2">
          {selectedSkills.map((skill, index) => (
            <span key={index} className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm flex items-center">
              {skill}
              <button onClick={() => handleRemoveSkill(skill)} className="ml-2 text-xs">✕</button>
            </span>
          ))}
          {selectedSkills.length === 0 && (
            <p className="text-muted-foreground text-sm italic">No skills selected yet.</p>
          )}
        </div>
        <p className="text-right text-sm text-muted-foreground mb-6">{selectedSkills.length}/{maxSkills} skills selected</p>

        <div className="mb-8">
          <h3 className="font-semibold mb-3">Suggested skills:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map((skill) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                onClick={() => handleAddSkill(skill)}
                disabled={selectedSkills.includes(skill) || selectedSkills.length >= maxSkills}
              >
                + {skill}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={prevStep}>Back</Button>
          <Button onClick={nextStep}>Choose type of job</Button>
        </div>
      </div>
    </div>
  );
};

export default UserSelectInterestedCategory; 