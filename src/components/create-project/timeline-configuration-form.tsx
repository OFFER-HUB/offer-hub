"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TimelineConfigurationFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function TimelineConfigurationForm({
  onNext,
  onBack,
}: TimelineConfigurationFormProps) {
  const [projectType, setProjectType] = useState<"long-term" | "short-term">(
    "long-term"
  );

  const handleNext = () => {
    onNext();
  };

  const canProceed = projectType !== null;

  return (
    <Card className="w-full max-w-2xl min-h-[500px]">
      <CardHeader className="text-center py-8">
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Timeline
        </CardTitle>
        <p className="text-sm text-gray-600">
          Set your preferred budget for this project
        </p>
      </CardHeader>
      <CardContent className="space-y-8 flex flex-col justify-center flex-1">
        <div className="space-y-4">
          {/* Project Type Selection */}
          <div className="space-y-4">
            {/* Long Term Project Option */}
            <div
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                projectType === "long-term"
                  ? "border-teal-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setProjectType("long-term")}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Long term project
                  </h3>
                  <p className="text-sm text-gray-600">
                    More than thirty hours a week and/or will be longer than
                    three months.
                  </p>
                </div>
                <div className="ml-4">
                  {projectType === "long-term" ? (
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Short Term Project Option */}
            <div
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                projectType === "short-term"
                  ? "border-teal-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setProjectType("short-term")}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Short term project
                  </h3>
                  <p className="text-sm text-gray-600">
                    Less than thirty hours a week and/or will be shorter than
                    three months.
                  </p>
                </div>
                <div className="ml-4">
                  {projectType === "short-term" ? (
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 pt-8 items-center">
          <Button
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: "361px",
              height: "44px",
              borderRadius: "32px",
              padding: "16px",
              gap: "10px",
              color: "#FFFFFF",
            }}
            onClick={handleNext}
            disabled={!canProceed}
          >
            Post job
          </Button>

          <Button
            className="text-white font-medium hover:bg-opacity-90"
            style={{
              width: "361px",
              height: "44px",
              borderRadius: "32px",
              padding: "16px",
              gap: "10px",
              backgroundColor: "#149A9B",
              color: "#FFFFFF",
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
