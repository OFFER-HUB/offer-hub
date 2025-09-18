"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  X,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  Target,
  Heart,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import { ResponseGuidelinesProps } from "@/types/review-responses.types";

export default function ResponseGuidelines({
  guidelines,
  onClose,
}: ResponseGuidelinesProps) {
  const bestPractices = [
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Show Gratitude",
      description:
        "Always thank the reviewer for taking the time to provide feedback",
      example: "Thank you for your detailed feedback...",
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Be Specific",
      description: "Address specific points mentioned in the review",
      example: "I understand your concern about the communication timeline...",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Mention Improvements",
      description: "Share how you'll improve based on the feedback",
      example: "I'll implement better project tracking tools...",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Professional Tone",
      description: "Maintain a constructive and professional tone throughout",
      example: "I appreciate your honest assessment and will work on...",
    },
  ];

  const commonMistakes = [
    "Being defensive or argumentative",
    "Making excuses without acknowledging issues",
    "Using unprofessional language",
    "Ignoring specific feedback points",
    "Making personal attacks",
    "Sharing contact information outside the platform",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              Response Guidelines & Best Practices
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overview */}
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <strong>Why respond to reviews?</strong> Professional responses
              show your commitment to quality, help clarify misunderstandings,
              and demonstrate your professionalism to potential clients.
            </AlertDescription>
          </Alert>

          {/* Guidelines from API */}
          {guidelines && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Platform Guidelines
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Professional Tone
                    </h4>
                    <p className="text-sm text-blue-800">
                      {guidelines.professional_tone}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      Be Specific
                    </h4>
                    <p className="text-sm text-green-800">
                      {guidelines.specificity}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">
                      Show Gratitude
                    </h4>
                    <p className="text-sm text-purple-800">
                      {guidelines.gratitude}
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">
                      Action Items
                    </h4>
                    <p className="text-sm text-orange-800">
                      {guidelines.action_items}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Length Guidelines
                </h4>
                <p className="text-sm text-gray-700">
                  {guidelines.length_guidelines}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">
                    Min: {guidelines.validation_rules.min_length} chars
                  </Badge>
                  <Badge variant="outline">
                    Max: {guidelines.validation_rules.max_length} chars
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Best Practices */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Best Practices
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {bestPractices.map((practice, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 mt-0.5">{practice.icon}</div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        {practice.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {practice.description}
                      </p>
                      <div className="p-2 bg-gray-50 rounded text-xs text-gray-700 italic">
                        "{practice.example}"
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          {guidelines && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Examples</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-2">
                        Good Response
                      </h4>
                      <p className="text-sm text-green-800 italic">
                        "{guidelines.examples.good}"
                      </p>
                      <div className="mt-2 flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          Professional
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Constructive
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Specific
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">
                        Poor Response
                      </h4>
                      <p className="text-sm text-red-800 italic">
                        "{guidelines.examples.bad}"
                      </p>
                      <div className="mt-2 flex gap-1">
                        <Badge
                          variant="outline"
                          className="text-xs text-red-600"
                        >
                          Defensive
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs text-red-600"
                        >
                          Unprofessional
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs text-red-600"
                        >
                          Vague
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Common Mistakes to Avoid
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
              {commonMistakes.map((mistake, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-800">{mistake}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prohibited Content */}
          {guidelines && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Prohibited Content
              </h3>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 mb-3">
                  The following content is not allowed in responses:
                </p>
                <div className="flex flex-wrap gap-2">
                  {guidelines.validation_rules.prohibited_content.map(
                    (content, index) => (
                      <Badge
                        key={index}
                        variant="destructive"
                        className="text-xs"
                      >
                        {content}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tips for Success */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Tips for Success
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-900 mb-1">
                  Respond Quickly
                </h4>
                <p className="text-sm text-blue-800">
                  Respond within 24-48 hours for best impact
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-900 mb-1">Be Detailed</h4>
                <p className="text-sm text-green-800">
                  Address specific points from the review
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-purple-900 mb-1">
                  Show Growth
                </h4>
                <p className="text-sm text-purple-800">
                  Demonstrate how you'll improve
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              Got it! Let's write a response
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
