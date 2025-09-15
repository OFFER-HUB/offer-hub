'use client';

import React, { useState, useRef } from 'react';
import { Achievement, BadgeDisplayConfig, UserAchievement } from '@/types/achievement.types';
import { 
  getRarityColor, 
  getRarityGradient, 
  getRarityIcon, 
  formatProgressText,
  getAchievementStatusColor,
  getAchievementStatusIcon
} from '@/utils/achievement-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Share2, 
  Trophy, 
  Star, 
  Lock, 
  CheckCircle, 
  Clock, 
  Download,
  ExternalLink,
  Copy,
  Heart,
  MessageSquare,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  config?: Partial<BadgeDisplayConfig>;
  onShare?: (achievement: Achievement, platform: string) => void;
  onClaim?: (achievementId: string) => void;
  className?: string;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  achievement,
  userAchievement,
  config = {},
  onShare,
  onClaim,
  className
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const displayConfig: BadgeDisplayConfig = {
    size: 'md',
    showProgress: true,
    showRarity: true,
    showTooltip: true,
    showAnimation: true,
    ...config
  };

  const status = userAchievement?.status || 'locked';
  const progress = userAchievement?.progress || 0;
  const isCompleted = status === 'completed' || status === 'claimed';

  const handleAnimation = () => {
    if (displayConfig.showAnimation && isCompleted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleShare = (platform: string) => {
    onShare?.(achievement, platform);
    setShowShareMenu(false);
  };

  const handleClaim = () => {
    if (status === 'completed') {
      onClaim?.(achievement.id);
    }
  };

  const copyToClipboard = async () => {
    const shareText = `Check out my achievement: ${achievement.name} - ${achievement.description}`;
    try {
      await navigator.clipboard.writeText(shareText);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const sizeClasses = {
    xs: 'w-12 h-12 text-lg',
    sm: 'w-16 h-16 text-xl',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-24 h-24 text-3xl',
    xl: 'w-32 h-32 text-4xl'
  };

  const BadgeComponent = () => (
    <div
      ref={badgeRef}
      className={cn(
        'relative rounded-full border-2 flex items-center justify-center transition-all duration-300',
        sizeClasses[displayConfig.size],
        isAnimating && 'animate-pulse scale-110',
        status === 'locked' && 'opacity-50 grayscale',
        status === 'completed' && 'ring-2 ring-green-400',
        status === 'claimed' && 'ring-2 ring-blue-400'
      )}
      style={{
        background: isCompleted ? getRarityGradient(achievement.rarity) : achievement.backgroundColor,
        borderColor: isCompleted ? getRarityColor(achievement.rarity) : achievement.borderColor || achievement.color,
        color: isCompleted ? '#FFFFFF' : achievement.color
      }}
      onClick={handleAnimation}
    >
      {/* Badge Icon */}
      <div className="relative z-10">
        {typeof achievement.icon === 'string' ? (
          achievement.icon.endsWith('.png') || achievement.icon.startsWith('/badge/') ? (
            <img
              src={achievement.icon.startsWith('/badge/') ? achievement.icon : `/badge/${achievement.icon}`}
              alt={achievement.name}
              className={cn(
                displayConfig.size === 'xs' && 'w-8 h-8',
                displayConfig.size === 'sm' && 'w-10 h-10',
                displayConfig.size === 'md' && 'w-12 h-12',
                displayConfig.size === 'lg' && 'w-14 h-14',
                displayConfig.size === 'xl' && 'w-20 h-20',
                'object-contain rounded-full'
              )}
            />
          ) : (
            <span>{achievement.icon}</span>
          )
        ) : (
          achievement.icon
        )}
      </div>

      {/* Rarity Indicator */}
      {displayConfig.showRarity && isCompleted && (
        <div className="absolute -top-1 -right-1 text-xs bg-white rounded-full p-1 shadow-md">
          {getRarityIcon(achievement.rarity)}
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute -bottom-1 -right-1">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"
          style={{ backgroundColor: getAchievementStatusColor(status) }}
        >
          {getAchievementStatusIcon(status)}
        </div>
      </div>

      {/* Lock Overlay */}
      {status === 'locked' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Badge Display */}
      <div className="flex justify-center">
        {displayConfig.showTooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer">
                  <BadgeComponent />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-semibold">{achievement.name}</div>
                  <div className="text-sm">{achievement.description}</div>
                  {achievement.detailedDescription && (
                    <div className="text-xs text-gray-500">
                      {achievement.detailedDescription}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize">{achievement.rarity}</span>
                    <span className="capitalize">{achievement.category}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <BadgeComponent />
        )}
      </div>

      {/* Badge Information */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">{achievement.name}</h3>
        <p className="text-sm text-gray-600">{achievement.description}</p>
        
        {/* Progress Bar */}
        {displayConfig.showProgress && userAchievement && status !== 'locked' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              status === 'completed' && 'border-green-300 text-green-700 bg-green-50',
              status === 'in_progress' && 'border-yellow-300 text-yellow-700 bg-yellow-50',
              status === 'locked' && 'border-gray-300 text-gray-500 bg-gray-50',
              status === 'claimed' && 'border-blue-300 text-blue-700 bg-blue-50'
            )}
          >
            {status === 'completed' && '✅ Completed'}
            {status === 'in_progress' && '⏳ In Progress'}
            {status === 'locked' && '🔒 Locked'}
            {status === 'claimed' && '🏆 Claimed'}
          </Badge>
        </div>

        {/* Requirements Progress */}
        {userAchievement && userAchievement.progressDetails && status !== 'locked' && (
          <div className="space-y-2 text-xs">
            {userAchievement.progressDetails.map((detail, index) => (
              <div key={detail.requirementId} className="flex justify-between">
                <span className="text-gray-600">
                  {achievement.requirements[index]?.description}
                </span>
                <span className={cn(
                  'font-medium',
                  detail.isCompleted ? 'text-green-600' : 'text-gray-900'
                )}>
                  {formatProgressText(detail.current, detail.target, achievement.requirements[index]?.unit)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Rewards */}
        {achievement.rewards.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-700">Rewards:</div>
            <div className="flex flex-wrap justify-center gap-1">
              {achievement.rewards.map((reward, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reward.type === 'points' && '⭐'}
                  {reward.type === 'badge' && '🏆'}
                  {reward.type === 'discount' && '💰'}
                  {reward.type === 'nft' && '🎨'}
                  {reward.value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-2 pt-2">
          {status === 'completed' && !userAchievement?.claimedAt && (
            <Button 
              size="sm" 
              onClick={handleClaim}
              className="bg-green-600 hover:bg-green-700"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Claim
            </Button>
          )}
          
          {isCompleted && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          )}
        </div>

        {/* Share Menu */}
        {showShareMenu && (
          <div className="absolute z-50 mt-2 w-48 bg-white border rounded-lg shadow-lg">
            <div className="p-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Badge Grid Component
interface BadgeGridProps {
  achievements: Achievement[];
  userAchievements?: Record<string, UserAchievement>;
  config?: Partial<BadgeDisplayConfig>;
  onAchievementSelect?: (achievement: Achievement) => void;
  onShare?: (achievement: Achievement, platform: string) => void;
  onClaim?: (achievementId: string) => void;
  className?: string;
  variant?: 'badge' | 'achievement';
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({
  achievements,
  userAchievements = {},
  config = {},
  onAchievementSelect,
  onShare,
  onClaim,
  className,
  variant = 'badge'
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    onAchievementSelect?.(achievement);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Grid */}
      <div className={cn(
        variant === 'badge'
          ? 'grid grid-cols-2 md:grid-cols-3 3xl:grid-cols-4 gap-4'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      )}>
        {achievements.map((achievement) => {
          const ua = userAchievements[achievement.id];
          if (variant === 'badge') {
            return (
          <Card 
            key={achievement.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              selectedAchievement?.id === achievement.id && 'ring-2 ring-blue-500 shadow-lg'
            )}
            onClick={() => handleAchievementClick(achievement)}
          >
            <CardContent className="p-4">
              <BadgeDisplay
                achievement={achievement}
                    userAchievement={ua}
                config={config}
                onShare={onShare}
                onClaim={onClaim}
              />
            </CardContent>
          </Card>
            );
          }

          // Achievement variant: rectangular info card with inline details
          return (
            <Card key={achievement.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center border text-sm" style={{ borderColor: achievement.color, color: achievement.color }}>
                    {typeof achievement.icon === 'string' ? achievement.icon : null}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{achievement.name}</div>
                      {ua?.status && (
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border',
                          ua.status === 'completed' && 'border-green-300 text-green-700 bg-green-50',
                          ua.status === 'in_progress' && 'border-yellow-300 text-yellow-700 bg-yellow-50',
                          (!ua?.status || ua.status === 'locked') && 'border-gray-300 text-gray-600 bg-gray-50'
                        )}>
                          {ua.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{achievement.description}</div>
                    {ua && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${ua.progress || 0}%` }} />
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500">{ua.progress || 0}%</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => onAchievementSelect?.(achievement)}>View</Button>
                    {ua?.status === 'completed' && !ua?.claimedAt && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onClaim?.(achievement.id)}>Claim</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Achievement Details */}
      {selectedAchievement && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <BadgeDisplay
                achievement={selectedAchievement}
                userAchievement={userAchievements[selectedAchievement.id]}
                config={{ ...config, size: 'lg' }}
                onShare={onShare}
                onClaim={onClaim}
              />
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedAchievement.name}</h3>
                  <p className="text-gray-600">{selectedAchievement.description}</p>
                  {selectedAchievement.detailedDescription && (
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedAchievement.detailedDescription}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <Badge variant="outline">
                    {selectedAchievement.category}
                  </Badge>
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: getRarityColor(selectedAchievement.rarity),
                      color: getRarityColor(selectedAchievement.rarity)
                    }}
                  >
                    {getRarityIcon(selectedAchievement.rarity)} {selectedAchievement.rarity}
                  </Badge>
                </div>

                {selectedAchievement.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedAchievement.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Badge Collection Summary
interface BadgeCollectionProps {
  userAchievements: Record<string, UserAchievement>;
  achievements: Achievement[];
  className?: string;
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  userAchievements,
  achievements,
  className
}) => {
  const completedAchievements = Object.values(userAchievements).filter(
    ua => ua.status === 'completed' || ua.status === 'claimed'
  );
  
  const inProgressAchievements = Object.values(userAchievements).filter(
    ua => ua.status === 'in_progress'
  );

  const totalPoints = completedAchievements.reduce((sum, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievementId);
    const points = achievement?.rewards.find(r => r.type === 'points')?.value as number || 0;
    return sum + points;
  }, 0);

  const rarityBreakdown = completedAchievements.reduce((acc, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievementId);
    if (achievement) {
      acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold">Your Badge Collection</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{achievements.length}</div>
          <div className="text-sm text-gray-600">Total Available</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedAchievements.length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{inProgressAchievements.length}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
          <div className="text-sm text-gray-600">Total Points</div>
        </Card>
      </div>

      {Object.keys(rarityBreakdown).length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Badge Rarity Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(rarityBreakdown).map(([rarity, count]) => (
              <Badge 
                key={rarity}
                variant="outline"
                style={{ 
                  borderColor: getRarityColor(rarity as any),
                  color: getRarityColor(rarity as any)
                }}
              >
                {getRarityIcon(rarity as any)} {rarity}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

