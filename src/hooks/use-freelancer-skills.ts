import { useState, useEffect } from 'react';
import { ProfileStepProps } from '@/app/types/freelancer-profile';
import { Skill } from '@/data/mock-freelancer-skills';

export function useFreelancerSkills({ userData, updateUserData }: ProfileStepProps) {
    const [skills, setSkills] = useState<string[]>(userData?.skills || []);
    const [searchInput, setSearchInput] = useState('');

    // Update parent component when skills change
    useEffect(() => {
        if (updateUserData) {
            updateUserData({ skills });
        }
    }, [skills, updateUserData]);

    const handleAddSkill = (skill: string) => {
        if (skills.length >= 15) return;
        if (!skills.includes(skill)) {
            setSkills([...skills, skill]);
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim() && !skills.includes(searchInput.trim())) {
            handleAddSkill(searchInput.trim());
            setSearchInput('');
        }
    };

    return {
        skills,
        searchInput,
        setSearchInput,
        handleAddSkill,
        handleRemoveSkill,
        handleSearchSubmit,
    };
} 