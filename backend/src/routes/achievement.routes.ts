import { Router } from "express";
import { authenticateToken } from "@/middlewares/auth.middleware";

const router = Router();

// Mock achievement data
const MOCK_ACHIEVEMENTS = [
  {
    id: 'first_project',
    name: 'First Project',
    description: 'Complete your first project',
    type: 'project_completion',
    category: 'Project Completion',
    rarity: 'common',
    icon: '/badge/badge-batman.png',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    requirements: [
      {
        id: 'complete_project',
        type: 'count',
        metric: 'projects_completed',
        target: 1,
        current: 0,
        description: 'Complete 1 project',
        isCompleted: false
      }
    ],
    rewards: [
      {
        id: 'points_reward',
        type: 'points',
        value: 100,
        description: '100 points'
      }
    ],
    isHidden: false,
    isRepeatable: false,
    tags: ['beginner', 'milestone'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'five_star_rating',
    name: 'Five Star Performer',
    description: 'Achieve a 5-star rating',
    type: 'rating_milestone',
    category: 'Rating Milestone',
    rarity: 'rare',
    icon: '/badge/badge-vip.png',
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
    requirements: [
      {
        id: 'five_star_requirement',
        type: 'value',
        metric: 'average_rating',
        target: 5,
        current: 0,
        unit: 'stars',
        description: 'Maintain 5-star average rating',
        isCompleted: false
      }
    ],
    rewards: [
      {
        id: 'badge_reward',
        type: 'badge',
        value: 'five_star_badge',
        description: 'Five Star Badge'
      },
      {
        id: 'points_reward',
        type: 'points',
        value: 500,
        description: '500 points'
      }
    ],
    isHidden: false,
    isRepeatable: false,
    tags: ['excellence', 'rating'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Help 10 community members',
    type: 'community_contribution',
    category: 'Community Contribution',
    rarity: 'uncommon',
    icon: '/badge/badge-child.png',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    requirements: [
      {
        id: 'help_members',
        type: 'count',
        metric: 'community_helps',
        target: 10,
        current: 0,
        description: 'Help 10 community members',
        isCompleted: false
      }
    ],
    rewards: [
      {
        id: 'points_reward',
        type: 'points',
        value: 300,
        description: '300 points'
      }
    ],
    isHidden: false,
    isRepeatable: false,
    tags: ['community', 'helping'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/achievements - Get all achievements
router.get("/", (req, res) => {
  res.json(MOCK_ACHIEVEMENTS);
});

// GET /api/users/:userId/achievements - Get user achievements
router.get("/users/:userId/achievements", (req, res) => {
  const { userId } = req.params;
  
  // Mock user achievements - all locked initially
  const userAchievements = MOCK_ACHIEVEMENTS.reduce((acc, achievement) => {
    acc[achievement.id] = {
      achievementId: achievement.id,
      status: 'locked',
      progress: 0,
      progressDetails: achievement.requirements.map(req => ({
        requirementId: req.id,
        current: 0,
        target: req.target,
        lastUpdated: new Date().toISOString(),
        isCompleted: false
      })),
      lastProgressUpdate: new Date().toISOString()
    };
    return acc;
  }, {} as Record<string, any>);

  res.json(userAchievements);
});

// GET /api/users/:userId/achievements/analytics - Get user achievement analytics
router.get("/users/:userId/achievements/analytics", (req, res) => {
  const analytics = {
    totalAchievements: MOCK_ACHIEVEMENTS.length,
    completedAchievements: 0,
    inProgressAchievements: 0,
    lockedAchievements: MOCK_ACHIEVEMENTS.length,
    totalPoints: 0,
    averageCompletionTime: 0,
    mostPopularCategory: 'Project Completion',
    recentAchievements: [],
    streakInfo: {
      current: 0,
      longest: 0
    },
    categoryBreakdown: {
      'Project Completion': { total: 1, completed: 0, percentage: 0 },
      'Rating Milestone': { total: 1, completed: 0, percentage: 0 },
      'Community Contribution': { total: 1, completed: 0, percentage: 0 }
    }
  };
  
  res.json(analytics);
});

// GET /api/achievements/leaderboard - Get achievement leaderboard
router.get("/leaderboard", (req, res) => {
  res.json([]);
});

// POST /api/users/:userId/achievements/:achievementId/claim - Claim achievement
router.post("/users/:userId/achievements/:achievementId/claim", (req, res) => {
  res.json({ success: true, message: 'Achievement claimed' });
});

// POST /api/users/:userId/achievements/progress - Update user progress
router.post("/users/:userId/achievements/progress", (req, res) => {
  res.json({ success: true, message: 'Progress updated' });
});

// POST /api/achievements/share - Share achievement
router.post("/share", (req, res) => {
  res.json({ success: true, message: 'Achievement shared' });
});

// PATCH /api/notifications/:notificationId/read - Mark notification as read
router.patch("/notifications/:notificationId/read", (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
});

export default router;
