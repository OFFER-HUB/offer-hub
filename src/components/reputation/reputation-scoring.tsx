/**
 * @fileoverview Reputation score calculation and display component
 * @author OnlyDust Platform
 * @license MIT
 */

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { ReputationScore, ReputationCategory, BenchmarkData } from "@/types/reputation-analytics.types";
import { Star, TrendingUp, TrendingDown, Minus, Info, Award } from "lucide-react";

interface ReputationScoringProps {
  score: ReputationScore;
  categories: ReputationCategory[];
  benchmarks: BenchmarkData[];
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export default function ReputationScoring({
  score,
  categories,
  benchmarks,
  showDetails = true,
  compact = false,
  className = ""
}: ReputationScoringProps) {
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 90) return "text-green-600";
    if (scoreValue >= 75) return "text-blue-600";
    if (scoreValue >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreGradient = (scoreValue: number) => {
    if (scoreValue >= 90) return "from-green-500 to-green-600";
    if (scoreValue >= 75) return "from-blue-500 to-blue-600";
    if (scoreValue >= 60) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  const getScoreLabel = (scoreValue: number) => {
    if (scoreValue >= 90) return "Excellent";
    if (scoreValue >= 75) return "Good";
    if (scoreValue >= 60) return "Average";
    return "Needs Improvement";
  };

  const getTrendIcon = (trend: string, trendPercentage: number) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getBenchmarkPosition = (userScore: number, benchmark: BenchmarkData) => {
    const { platformAverage, topPercentile } = benchmark;
    if (userScore >= topPercentile) return { label: "Top Performer", color: "bg-green-100 text-green-800" };
    if (userScore >= platformAverage) return { label: "Above Average", color: "bg-blue-100 text-blue-800" };
    return { label: "Below Average", color: "bg-yellow-100 text-yellow-800" };
  };

  if (compact) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getScoreGradient(score.overall)} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{Math.round(score.overall)}</span>
                </div>
                <Award className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Reputation Score</h3>
                <p className={`text-sm ${getScoreColor(score.overall)}`}>
                  {getScoreLabel(score.overall)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-1">
                {benchmarks.find(b => b.category === "overall")?.percentileRank?.toFixed(0) || 0}th percentile
              </Badge>
              <div className="text-xs text-gray-500">
                Last updated: {score.lastUpdated.toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getScoreGradient(score.overall)} flex items-center justify-center mb-4 relative`}>
              <span className="text-white font-bold text-3xl">{Math.round(score.overall)}</span>
              <Award className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Overall Reputation Score</h2>
            <p className={`text-lg ${getScoreColor(score.overall)} mb-2`}>
              {getScoreLabel(score.overall)}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Last updated: {score.lastUpdated.toLocaleDateString()}</span>
              <Badge variant="secondary">
                {benchmarks.find(b => b.category === "overall")?.percentileRank?.toFixed(0) || 0}th percentile
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {benchmarks.find(b => b.category === "overall") && (
              <>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">
                    {benchmarks.find(b => b.category === "overall")?.platformAverage.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">Platform Average</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">
                    {benchmarks.find(b => b.category === "overall")?.topPercentile.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">Top 10%</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">
                    {benchmarks.find(b => b.category === "overall")?.percentileRank.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Your Percentile</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {categories.map((category) => {
                const benchmark = benchmarks.find(b => b.category === category.id);
                const position = benchmark ? getBenchmarkPosition(category.score, benchmark) : null;

                return (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-lg">{category.name}</h4>
                        <Tooltip content={category.description}>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </Tooltip>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(category.trend, category.trendPercentage)}
                          <span className="text-sm text-gray-500">
                            {category.trendPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {position && (
                          <Badge className={position.color}>
                            {position.label}
                          </Badge>
                        )}
                        <span className={`text-xl font-bold ${getScoreColor(category.score)}`}>
                          {category.score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{category.score.toFixed(1)}/100</span>
                      </div>
                      <Progress
                        value={category.score}
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Weight: </span>
                        <span className="font-medium">{(category.weight * 100).toFixed(0)}%</span>
                      </div>
                      {benchmark && (
                        <div className="text-gray-500">
                          Platform avg: {benchmark.platformAverage.toFixed(1)}
                        </div>
                      )}
                    </div>

                    {category.skills.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-2">Related Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {category.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Score Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(score.communication)}`}>
                {score.communication.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Communication</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(score.qualityOfWork)}`}>
                {score.qualityOfWork.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Quality</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(score.timeliness)}`}>
                {score.timeliness.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Timeliness</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(score.professionalism)}`}>
                {score.professionalism.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Professional</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(score.reliability)}`}>
                {score.reliability.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Reliability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}