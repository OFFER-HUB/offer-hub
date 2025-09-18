"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle } from "lucide-react";
import { WorkExperience } from "@/lib/mockData/freelancer-profile-mock";

interface ExperienceSectionProps {
  experience: WorkExperience[];
}

export default function ExperienceSection({ experience }: ExperienceSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''}${diffMonths > 0 ? ` ${diffMonths} month${diffMonths > 1 ? 's' : ''}` : ''}`;
    }
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Work Experience</h2>
      
      <div className="space-y-6">
        {experience.map((exp, index) => (
          <div key={exp.id} className="relative">
            {/* Timeline connector */}
            {index < experience.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" />
            )}
            
            <div className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-teal-600 rounded-full" />
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {exp.position}
                    </h3>
                    <p className="text-gray-700 font-medium">{exp.company}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getDuration(exp.startDate, exp.endDate)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  {exp.description}
                </p>
                
                {/* Achievements */}
                {exp.achievements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-800">Key Achievements:</h4>
                    <ul className="space-y-1">
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
