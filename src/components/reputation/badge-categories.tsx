"use client";
import React, { useState, useMemo } from "react";
import { BadgeCategory, Achievement } from "@/types/achievement.types";
import { getCategoryIcon, getCategoryColor } from "@/utils/achievement-helpers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronRight,
  Trophy,
  Star,
  Users,
  Target,
  DollarSign,
  Calendar,
  Sparkles,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeCategoriesProps {
  categories: BadgeCategory[];
  userAchievements?: Record<string, any>;
  onCategorySelect?: (categoryId: string) => void;
  onAchievementSelect?: (achievement: Achievement) => void;
  selectedCategory?: string;
  className?: string;
}

const categoryIcons = {
  "Project Completion": Target,
  "Skill Mastery": Star,
  "Community Contribution": Users,
  "Rating Milestone": Trophy,
  "Earning Milestone": DollarSign,
  "Platform Milestone": Calendar,
  "Special Event": Sparkles,
  Custom: Palette,
};

export const BadgeCategories: React.FC<BadgeCategoriesProps> = ({
  categories,
  userAchievements = {},
  onCategorySelect,
  onAchievementSelect,
  selectedCategory,
  className,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getCategoryProgress = (category: BadgeCategory) => {
    if (!userAchievements || category.totalCount === 0) return 0;

    const completedCount = category.achievements.filter((achievement) => {
      const ua = userAchievements[achievement.id];
      return ua?.status === "completed" || ua?.status === "claimed";
    }).length;

    return Math.round((completedCount / category.totalCount) * 100);
  };

  const getCategoryStats = (category: BadgeCategory) => {
    const completedCount = category.achievements.filter((achievement) => {
      const userAchievement = userAchievements[achievement.id];
      return userAchievement?.status === "completed";
    }).length;

    const inProgressCount = category.achievements.filter((achievement) => {
      const userAchievement = userAchievements[achievement.id];
      return userAchievement?.status === "in_progress";
    }).length;

    return {
      completed: completedCount,
      inProgress: inProgressCount,
      total: category.totalCount,
      locked: category.totalCount - completedCount - inProgressCount,
    };
  };

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const aProgress = getCategoryProgress(a);
      const bProgress = getCategoryProgress(b);
      return bProgress - aProgress;
    });
  }, [categories, userAchievements]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Achievement Categories
        </h2>
        <Badge variant="secondary" className="text-sm">
          {categories.length} Categories
        </Badge>
      </div>

      <div className="grid gap-4">
        {sortedCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const isExpanded = expandedCategories.has(category.id) || isSelected;
          const progress = getCategoryProgress(category);
          const stats = getCategoryStats(category);
          const IconComponent =
            categoryIcons[category.name as keyof typeof categoryIcons] ||
            Trophy;

          return (
            <Card
              key={category.id}
              className={cn(
                "transition-all duration-200 hover:shadow-md cursor-pointer",
                isSelected && "ring-2 ring-blue-500 shadow-lg"
              )}
              onClick={() => {
                onCategorySelect?.(category.id);
                toggleCategory(category.id);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {stats.completed}/{stats.total}
                      </div>
                      <div className="text-xs text-gray-500">
                        {progress}% Complete
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(category.id);
                      }}
                      className="p-1"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2"
                    style={
                      {
                        "--progress-background": category.color,
                      } as React.CSSProperties
                    }
                  />

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>✅ {stats.completed} completed</span>
                    <span>⏳ {stats.inProgress} in progress</span>
                    <span>🔒 {stats.locked} locked</span>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Achievements in this category:
                    </h4>
                    <div className="grid gap-2">
                      {category.achievements.map((achievement) => {
                        const userAchievement =
                          userAchievements[achievement.id];
                        const status = userAchievement?.status || "locked";

                        return (
                          <div
                            key={achievement.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border transition-colors",
                              "hover:bg-gray-50 cursor-pointer",
                              status === "completed" &&
                                "bg-green-50 border-green-200",
                              status === "in_progress" &&
                                "bg-yellow-50 border-yellow-200",
                              status === "locked" &&
                                "bg-gray-50 border-gray-200"
                            )}
                            onClick={() => onAchievementSelect?.(achievement)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{achievement.icon}</div>
                              <div>
                                <div className="font-medium text-sm">
                                  {achievement.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {achievement.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  status === "completed" &&
                                    "border-green-300 text-green-700",
                                  status === "in_progress" &&
                                    "border-yellow-300 text-yellow-700",
                                  status === "locked" &&
                                    "border-gray-300 text-gray-500"
                                )}
                              >
                                {status === "completed" && "✅ Completed"}
                                {status === "in_progress" && "⏳ In Progress"}
                                {status === "locked" && "🔒 Locked"}
                              </Badge>

                              {userAchievement?.progress !== undefined && (
                                <div className="text-xs text-gray-500">
                                  {userAchievement.progress}%
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              No Achievement Categories
            </h3>
            <p className="text-sm">
              Achievement categories will appear here once they are configured.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

// Category Filter Component
interface CategoryFilterProps {
  categories: BadgeCategory[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  className,
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
      >
        All Categories
      </Button>

      {categories.map((category) => {
        const IconComponent =
          categoryIcons[category.name as keyof typeof categoryIcons] || Trophy;

        return (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="flex items-center space-x-2"
          >
            <IconComponent className="w-4 h-4" />
            <span>{category.name}</span>
          </Button>
        );
      })}
    </div>
  );
};

// Category Stats Summary
interface CategoryStatsProps {
  categories: BadgeCategory[];
  userAchievements?: Record<string, any>;
  className?: string;
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({
  categories,
  userAchievements = {},
  className,
}) => {
  const totalStats = useMemo(() => {
    let totalAchievements = 0;
    let completedAchievements = 0;
    let inProgressAchievements = 0;

    categories.forEach((category) => {
      totalAchievements += category.totalCount;

      category.achievements.forEach((achievement) => {
        const userAchievement = userAchievements[achievement.id];
        if (userAchievement?.status === "completed") {
          completedAchievements++;
        } else if (userAchievement?.status === "in_progress") {
          inProgressAchievements++;
        }
      });
    });

    return {
      total: totalAchievements,
      completed: completedAchievements,
      inProgress: inProgressAchievements,
      locked:
        totalAchievements - completedAchievements - inProgressAchievements,
    };
  }, [categories, userAchievements]);

  const completionPercentage =
    totalStats.total > 0
      ? Math.round((totalStats.completed / totalStats.total) * 100)
      : 0;

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          {totalStats.total}
        </div>
        <div className="text-sm text-gray-600">Total Achievements</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-green-600">
          {totalStats.completed}
        </div>
        <div className="text-sm text-gray-600">Completed</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {totalStats.inProgress}
        </div>
        <div className="text-sm text-gray-600">In Progress</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-gray-600">
          {completionPercentage}%
        </div>
        <div className="text-sm text-gray-600">Completion Rate</div>
      </Card>
    </div>
  );
};
