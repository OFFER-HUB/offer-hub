import { User } from '@/interfaces/user.interface';
import { Briefcase, TrendingUp, Users, MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';

// Interfaces for data types
export interface Category {
  name: string;
  description: string;
  icon: ReactNode;
  link: string;
}

export interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  verified: boolean;
}

export interface Step {
  title: string;
  description: string;
}

export interface Testimonial {
  text: string;
  name: string;
  role: string;
  avatar: string;
}

// Data for categories section
export const categories: Category[] = [
  {
    name: 'Web & Mobile Design',
    description: 'UI/UX design for websites and mobile applications',
    icon: <Briefcase className='h-6 w-6 text-[#15949C]' />,
    link: '/categories/web-design',
  },
  {
    name: 'Development & IT',
    description: 'Web, mobile, and software development services',
    icon: <TrendingUp className='h-6 w-6 text-[#15949C]' />,
    link: '/categories/development',
  },
  {
    name: 'Marketing',
    description: 'Digital marketing, SEO, and social media services',
    icon: <Users className='h-6 w-6 text-[#15949C]' />,
    link: '/categories/marketing',
  },
  {
    name: 'Writing & Translation',
    description: 'Content creation and language translation',
    icon: <MessageSquare className='h-6 w-6 text-[#15949C]' />,
    link: '/categories/writing',
  },
];

// Data for freelancers section
export const freelancers: Freelancer[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    title: 'UI/UX Designer',
    avatar: '/person1.png',
    rating: 5,
    reviews: 127,
    hourlyRate: 45,
    verified: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    title: 'Full Stack Developer',
    avatar: '/person2.png',
    rating: 4,
    reviews: 89,
    hourlyRate: 65,
    verified: true,
  },
  {
    id: '3',
    name: 'Michael Chen',
    title: 'Digital Marketing Specialist',
    avatar: '/person3.png',
    rating: 5,
    reviews: 56,
    hourlyRate: 40,
    verified: false,
  },
];

// Data for how it works section
export const steps: Step[] = [
  {
    title: 'Post a Project',
    description:
      'Describe your project and the skills you\'re looking for to find the perfect match.',
  },
  {
    title: 'Review Proposals',
    description:
      'Browse through proposals from talented freelancers and select the best fit.',
  },
  {
    title: 'Collaborate & Pay',
    description:
      'Work together seamlessly and release payment when you\'re satisfied with the results.',
  },
];

// Data for testimonials section
export const testimonials: Testimonial[] = [
  {
    text: 'Offer Hub helped me find the perfect designer for my brand. The process was smooth and the results exceeded my expectations!',
    name: 'Emma Wilson',
    role: 'Business Owner',
    avatar: '/person5.png',
  },
  {
    text: 'As a freelancer, I\'ve been able to connect with amazing clients and grow my business through this platform.',
    name: 'David Rodriguez',
    role: 'Web Developer',
    avatar: '/person6.png',
  },
  {
    text: 'The quality of talent on this platform is outstanding. I\'ve completed multiple projects and will definitely be back for more.',
    name: 'Jennifer Lee',
    role: 'Marketing Director',
    avatar: '/person4.png',
  },
];

// Data for popular tags in hero section
export const popularTags = [
  'Web Design',
  'Logo Design',
  'Content Writing',
  'App Development',
  'Marketing',
];

export const users: User[] = [
  {
    id: 164364,
    name: 'Darlene Robertson',
    email: 'darlene@example.com',
    emailValidated: true,
    identityCard: 'id_card_1.pdf',
    status: 'Pending',
    submissionDate: '2016-03-04',
    location: 'New York, USA',
    role: 'Freelancer',
    analytics: {
      totalClients: 40,
      clientsChange: 8.5,
      completedJobs: 102,
      jobsChange: 13,
      totalPayments: 89000,
      paymentsChange: -5.3,
      profileViews: 134,
      viewsChange: -5.3,
    }
  },
  {
    id: 668373,
    name: 'Guy Hawkins',
    email: 'guy@example.com',
    emailValidated: true,
    identityCard: 'id_card_2.pdf',
    status: 'Approved',
    submissionDate: '2019-07-11',
    location: 'Los Angeles, USA',
    role: 'User',
    analytics: {
      totalClients: 35,
      clientsChange: 12.2,
      completedJobs: 87,
      jobsChange: 8.7,
      totalPayments: 76500,
      paymentsChange: 15.8,
      profileViews: 98,
      viewsChange: 22.1,
    }
  },
  {
    id: 793858,
    name: 'Esther Howard',
    email: 'esther@example.com',
    emailValidated: true,
    identityCard: 'id_card_3.pdf',
    status: 'Pending',
    submissionDate: '2012-10-28',
    location: 'Chicago, USA',
    role: 'Freelancer',
    analytics: {
      totalClients: 52,
      clientsChange: -2.1,
      completedJobs: 145,
      jobsChange: 5.4,
      totalPayments: 112000,
      paymentsChange: 8.9,
      profileViews: 187,
      viewsChange: -1.2,
    }
  },
  {
    id: 167844,
    name: 'Wade Warren',
    email: 'wade@example.com',
    emailValidated: true,
    identityCard: 'id_card_4.pdf',
    status: 'Approved',
    submissionDate: '2012-05-19',
    location: 'San Francisco, USA',
    role: 'User',
    analytics: {
      totalClients: 28,
      clientsChange: 18.3,
      completedJobs: 73,
      jobsChange: 25.6,
      totalPayments: 54200,
      paymentsChange: 32.1,
      profileViews: 156,
      viewsChange: 14.7,
    }
  },
  {
    id: 956546,
    name: 'Devon Lane',
    email: 'devon@example.com',
    emailValidated: true,
    identityCard: 'id_card_5.pdf',
    status: 'Pending',
    location: 'England',
    role: 'Customer',
    submissionDate: '2012-04-21',
    analytics: {
      totalClients: 63,
      clientsChange: 7.8,
      completedJobs: 198,
      jobsChange: -3.2,
      totalPayments: 145000,
      paymentsChange: 12.4,
      profileViews: 234,
      viewsChange: 9.8,
    }
  },
  {
    id: 744765,
    name: 'Kathryn Murphy',
    email: 'kathryn@example.com',
    emailValidated: true,
    identityCard: 'id_card_6.pdf',
    status: 'Approved',
    location: 'London, UK',
    submissionDate: '2015-05-27',
    role: 'Freelancer',
    analytics: {
      totalClients: 41,
      clientsChange: -4.6,
      completedJobs: 119,
      jobsChange: 16.8,
      totalPayments: 98700,
      paymentsChange: -8.1,
      profileViews: 203,
      viewsChange: 11.3,
    }
  },
  {
    id: 834673,
    name: 'Cameron Williamson',
    email: 'cameron@example.com',
    emailValidated: true,
    identityCard: 'id_card_7.pdf',
    status: 'Approved',
    location: 'Sydney, Australia',
    submissionDate: '2012-02-11',
    role: 'Customer',
    analytics: {
      totalClients: 37,
      clientsChange: 21.4,
      completedJobs: 156,
      jobsChange: 7.9,
      totalPayments: 87300,
      paymentsChange: 19.6,
      profileViews: 178,
      viewsChange: -6.4,
    }
  },
  {
    id: 845724,
    name: 'Floyd Miles',
    email: 'floyd@example.com',
    emailValidated: true,
    identityCard: 'id_card_8.pdf',
    status: 'Pending',
    location: 'Toronto, Canada',
    submissionDate: '2014-08-30',
    role: 'User',
    analytics: {
      totalClients: 29,
      clientsChange: 14.7,
      completedJobs: 84,
      jobsChange: -2.8,
      totalPayments: 67800,
      paymentsChange: 6.3,
      profileViews: 142,
      viewsChange: 18.9,
    }
  },
  {
    id: 845776,
    name: 'Ronald Richards',
    email: 'ronald@example.com',
    emailValidated: true,
    identityCard: 'id_card_9.pdf',
    status: 'Pending',
    location: 'Berlin, Germany',
    submissionDate: '2014-06-19',
    role: 'Customer',
    analytics: {
      totalClients: 48,
      clientsChange: 9.2,
      completedJobs: 167,
      jobsChange: 12.5,
      totalPayments: 123400,
      paymentsChange: -3.7,
      profileViews: 289,
      viewsChange: 8.1,
    }
  },
  {
    id: 168536,
    name: 'Annette Black',
    email: 'annette@example.com',
    emailValidated: true,
    identityCard: 'id_card_10.pdf',
    status: 'Pending',
    location: 'Tokyo, Japan',
    submissionDate: '2017-07-18',
    role: 'Freelancer',
    analytics: {
      totalClients: 33,
      clientsChange: -7.3,
      completedJobs: 91,
      jobsChange: 19.4,
      totalPayments: 71200,
      paymentsChange: 24.8,
      profileViews: 167,
      viewsChange: -12.6,
    }
  },
  {
    id: 184587,
    name: 'Dianne Russell',
    email: 'dianne@example.com',
    emailValidated: true,
    identityCard: 'id_card_11.pdf',
    status: 'Pending',
    location: 'Paris, France',
    submissionDate: '2016-11-07',
    role: 'User',
    analytics: {
      totalClients: 56,
      clientsChange: 13.8,
      completedJobs: 203,
      jobsChange: 6.7,
      totalPayments: 156700,
      paymentsChange: 11.9,
      profileViews: 312,
      viewsChange: 15.2,
    }
    
  },
  {
    id: 737952,
    name: 'Theresa Webb',
    email: 'theresa@example.com',
    emailValidated: true,
    identityCard: 'id_card_12.pdf',
    status: 'Pending',
    location: 'Madrid, Spain',
    submissionDate: '2015-05-27',
    role: 'Freelancer',
    analytics: {
      totalClients: 33,
      clientsChange: -7.3,
      completedJobs: 91,
      jobsChange: 19.4,
      totalPayments: 71200,
      paymentsChange: 24.8,
      profileViews: 167,
      viewsChange: -12.6,
    },
  },
];

// export const mockAnalyticsData: AnalyticsUser[] = [
//   {
//     id: 1,
//     name: "Darlene Robertson",
//     email: "darlene@example.com",
//     location: "USA",
//     userId: "wdsh1245w",
//     role: "Freelancer",
//     status: "Pending",
//     dateJoined: "2016-03-04",
//     analytics: {
//       totalClients: 40,
//       clientsChange: 8.5,
//       completedJobs: 102,
//       jobsChange: 13,
//       totalPayments: 89000,
//       paymentsChange: -5.3,
//       profileViews: 134,
//       viewsChange: -5.3,
//     },
//   },
//   {
//     id: 2,
//     name: "Guy Hawkins",
//     email: "guy@example.com",
//     location: "England",
//     userId: "wdsh1246w",
//     role: "User",
//     status: "Approved",
//     dateJoined: "2019-07-11",
//     analytics: {
//       totalClients: 35,
//       clientsChange: 12.2,
//       completedJobs: 87,
//       jobsChange: 8.7,
//       totalPayments: 76500,
//       paymentsChange: 15.8,
//       profileViews: 98,
//       viewsChange: 22.1,
//     },
//   },
//   {
//     id: 3,
//     name: "Esther Howard",
//     email: "esther@example.com",
//     location: "Germany",
//     userId: "wdsh1247w",
//     role: "Freelancer",
//     status: "Pending",
//     dateJoined: "2012-10-28",
//     analytics: {
//       totalClients: 52,
//       clientsChange: -2.1,
//       completedJobs: 145,
//       jobsChange: 5.4,
//       totalPayments: 112000,
//       paymentsChange: 8.9,
//       profileViews: 187,
//       viewsChange: -1.2,
//     },
//   },
//   {
//     id: 4,
//     name: "Wade Warren",
//     email: "wade@example.com",
//     location: "Italy",
//     userId: "wdsh1248w",
//     role: "User",
//     status: "Approved",
//     dateJoined: "2012-05-19",
//     analytics: {
//       totalClients: 28,
//       clientsChange: 18.3,
//       completedJobs: 73,
//       jobsChange: 25.6,
//       totalPayments: 54200,
//       paymentsChange: 32.1,
//       profileViews: 156,
//       viewsChange: 14.7,
//     },
//   },
//   {
//     id: 5,
//     name: "Devon Lane",
//     email: "devon@example.com",
//     location: "New Zealand",
//     userId: "wdsh1249w",
//     role: "Customer",
//     status: "Pending",
//     dateJoined: "2012-04-21",
//     analytics: {
//       totalClients: 63,
//       clientsChange: 7.8,
//       completedJobs: 198,
//       jobsChange: -3.2,
//       totalPayments: 145000,
//       paymentsChange: 12.4,
//       profileViews: 234,
//       viewsChange: 9.8,
//     },
//   },
//   {
//     id: 6,
//     name: "Kathryn Murphy",
//     email: "kathryn@example.com",
//     location: "Australia",
//     userId: "wdsh1250w",
//     role: "Freelancer",
//     status: "Approved",
//     dateJoined: "2015-05-27",
//     analytics: {
//       totalClients: 41,
//       clientsChange: -4.6,
//       completedJobs: 119,
//       jobsChange: 16.8,
//       totalPayments: 98700,
//       paymentsChange: -8.1,
//       profileViews: 203,
//       viewsChange: 11.3,
//     },
//   },
//   {
//     id: 7,
//     name: "Cameron Williamson",
//     email: "cameron@example.com",
//     location: "Ireland",
//     userId: "wdsh1251w",
//     role: "Customer",
//     status: "Approved",
//     dateJoined: "2012-02-11",
//     analytics: {
//       totalClients: 37,
//       clientsChange: 21.4,
//       completedJobs: 156,
//       jobsChange: 7.9,
//       totalPayments: 87300,
//       paymentsChange: 19.6,
//       profileViews: 178,
//       viewsChange: -6.4,
//     },
//   },
//   {
//     id: 8,
//     name: "Floyd Miles",
//     email: "floyd@example.com",
//     location: "Scotland",
//     userId: "wdsh1252w",
//     role: "User",
//     status: "Pending",
//     dateJoined: "2014-08-30",
//     analytics: {
//       totalClients: 29,
//       clientsChange: 14.7,
//       completedJobs: 84,
//       jobsChange: -2.8,
//       totalPayments: 67800,
//       paymentsChange: 6.3,
//       profileViews: 142,
//       viewsChange: 18.9,
//     },
//   },
//   {
//     id: 9,
//     name: "Ronald Richards",
//     email: "ronald@example.com",
//     location: "Brazil",
//     userId: "wdsh1253w",
//     role: "Customer",
//     status: "Pending",
//     dateJoined: "2014-06-19",
//     analytics: {
//       totalClients: 48,
//       clientsChange: 9.2,
//       completedJobs: 167,
//       jobsChange: 12.5,
//       totalPayments: 123400,
//       paymentsChange: -3.7,
//       profileViews: 289,
//       viewsChange: 8.1,
//     },
//   },
//   {
//     id: 10,
//     name: "Annette Black",
//     email: "annette@example.com",
//     location: "Japan",
//     userId: "wdsh1254w",
//     role: "Freelancer",
//     status: "Pending",
//     dateJoined: "2017-07-18",
//     analytics: {
//       totalClients: 33,
//       clientsChange: -7.3,
//       completedJobs: 91,
//       jobsChange: 19.4,
//       totalPayments: 71200,
//       paymentsChange: 24.8,
//       profileViews: 167,
//       viewsChange: -12.6,
//     },
//   },
//   {
//     id: 11,
//     name: "Dianne Russell",
//     email: "dianne@example.com",
//     location: "France",
//     userId: "wdsh1255w",
//     role: "User",
//     status: "Pending",
//     dateJoined: "2016-11-07",
//     analytics: {
//       totalClients: 56,
//       clientsChange: 13.8,
//       completedJobs: 203,
//       jobsChange: 6.7,
//       totalPayments: 156700,
//       paymentsChange: 11.9,
//       profileViews: 312,
//       viewsChange: 15.2,
//     },
//   },
//   {
//     id: 12,
//     name: "Theresa Webb",
//     email: "theresa@example.com",
//     location: "Mexico",
//     userId: "wdsh1256w",
//     role: "Freelancer",
//     status: "Pending",
//     dateJoined: "2015-05-27",
//     analytics: {
//       totalClients: 44,
//       clientsChange: 5.1,
//       completedJobs: 128,
//       jobsChange: -8.9,
//       totalPayments: 94500,
//       paymentsChange: 17.3,
//       profileViews: 198,
//       viewsChange: 3.4,
//     },
//   },
// ]