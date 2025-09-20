import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "./form-field";
import { SkillsSelector } from "./skills-selector";

interface ProjectDetailsFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function ProjectDetailsForm({ onNext, onBack }: ProjectDetailsFormProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [addedSkills, setAddedSkills] = useState([
    "Writing",
    "Design", 
    "Frontend",
    "Backend",
    "Research"
  ]);

  const canProceed = jobTitle.trim() !== "" && jobDescription.trim() !== "";

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Project details
        </CardTitle>
        <p className="text-sm text-gray-600">
          Create and post project you want to hire for
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Title */}
        <FormField
          label="Job title"
          id="jobTitle"
          placeholder="Give your job a title"
          value={jobTitle}
          onChange={setJobTitle}
          type="text"
        />

        {/* Job Description */}
        <FormField
          label="Job description"
          id="jobDescription"
          placeholder="Enter a description..."
          value={jobDescription}
          onChange={setJobDescription}
          type="textarea"
        />

        {/* Skills Required */}
        <SkillsSelector
          addedSkills={addedSkills}
          onSkillsChange={setAddedSkills}
        />

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 pt-6 items-center">
          <Button 
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: '361px',
              height: '44px',
              borderRadius: '32px',
              padding: '16px',
              gap: '10px',
              color: '#FFFFFF'
            }}
            onClick={onNext}
            disabled={!canProceed}
          >
            Next
          </Button>
          
          <Button 
            className="text-white font-medium hover:bg-opacity-90"
            style={{
              width: '361px',
              height: '44px',
              borderRadius: '32px',
              padding: '16px',
              gap: '10px',
              backgroundColor: '#149A9B',
              color: '#FFFFFF'
            }}
            onClick={onBack}
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 