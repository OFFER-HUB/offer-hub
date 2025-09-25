import { Conversation } from '../@types/conversation.entity';

export const conversationsData: Conversation[] = [
  {
    id: 1,
    name: 'Alex Morgan',
    avatar: '/profile.jpeg',
    message: 'I\'ll send you the updated designs',
    category: 'Website Redesign',
    unread: true,
    archived: false,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    avatar: '/profile.jpeg',
    message: 'The backend integration is complete',
    category: 'E-commerce Platform',
    unread: false,
    archived: false,
  },
  {
    id: 3,
    name: 'Michael Chen',
    avatar: '/profile.jpeg',
    message: 'I\'ve analyzed your website traffic',
    category: 'SEO Optimization',
    unread: true,
    archived: false,
  },
  {
    id: 4,
    name: 'Emma Wilson',
    avatar: '/profile.jpeg',
    message: 'The logo concepts are ready for review',
    category: 'Brand Identity',
    unread: false,
    archived: true,
  },
  {
    id: 5,
    name: 'David Rodriguez',
    avatar: '/profile.jpeg',
    message: 'I\'ve fixed the responsive issues on mobile',
    category: 'Mobile App Development',
    unread: false,
    archived: false,
  },
];
