export const SUGGESTED_SKILLS = [
    'Illustration',
    'Brand Development',
    'Web Design',
    'UI/UX Design',
    'Graphic Design',
    'Logo Design',
    'Social Media Marketing',
    'Content Writing',
    'Video Editing',
    'Photography',
] as const;

export type Skill = typeof SUGGESTED_SKILLS[number]; 