"use client";

import { Search, ArrowLeft } from 'lucide-react';
import Header from './header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFreelancerSteps } from '@/hooks/use-freelancer-steps';
import { ProfileStepProps } from '@/app/types/freelancer-profile';
import { useFreelancerSkills } from '@/hooks/use-freelancer-skills';
import { SUGGESTED_SKILLS } from '@/data/mock-freelancer-skills';

export default function UserSelectInterestedCategory(props: ProfileStepProps) {
    const { nextStep, prevStep } = useFreelancerSteps();
    const {
        skills,
        searchInput,
        setSearchInput,
        handleAddSkill,
        handleRemoveSkill,
        handleSearchSubmit,
    } = useFreelancerSkills(props);

    return (
        <div className="space-y-6">
            <Header title="3/10" />

            <h2 className="text-2xl font-semibold">
                You're close! What work are you here to do?
            </h2>
            <p className="text-[#149A9B]">
                Don't worry you can change these choices later on.
            </p>

            <div className="space-y-6 mt-8">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Enter skill here"
                        className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#149A9B]"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </form>

                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <div
                                key={skill}
                                className="bg-[#149A9B]/10 text-[#149A9B] px-3 py-1 rounded-full flex items-center gap-2"
                            >
                                <span>{skill}</span>
                                <button
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="text-[#149A9B] hover:text-[#149A9B]/80"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-medium mb-3">Suggested Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_SKILLS.map((skill) => (
                            <button
                                key={skill}
                                onClick={() => handleAddSkill(skill)}
                                disabled={skills.includes(skill) || skills.length >= 15}
                                className={cn(
                                    'px-4 py-2 rounded-full border transition-colors',
                                    skills.includes(skill)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'hover:bg-[#149A9B]/10 hover:border-[#149A9B] hover:text-[#149A9B]'
                                )}
                            >
                                + {skill}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <Button onClick={prevStep} variant="ghost" className="gap-1 rounded-full">
                    <ArrowLeft size={18} /> Back
                </Button>
                <Button
                    onClick={nextStep}
                    className="bg-[#149A9B] text-white rounded-full md:min-w-36"
                >
                    Choose type of job
                </Button>
            </div>
        </div>
    );
} 