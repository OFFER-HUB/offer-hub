export interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  totalEarned: number;
  completionRate: number;
  responseTime: string;
  lastActive: string;
  isVerified: boolean;
  isTopRated: boolean;
  bio: string;
  skills: Skill[];
  experience: WorkExperience[];
  education: Education[];
  languages: Language[];
  reviews: Review[];
}

export interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Language {
  name: string;
  level: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface Review {
  id: string;
  clientName: string;
  clientAvatar: string;
  rating: number;
  date: string;
  text: string;
  projectTitle: string;
  projectValue: number;
}

export const mockFreelancerProfiles: FreelancerProfile[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    location: 'San Francisco, USA',
    avatar: '/avatar_olivia.jpg',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 65,
    totalEarned: 25000,
    completionRate: 98,
    responseTime: '< 1 hour',
    lastActive: '2 hours ago',
    isVerified: true,
    isTopRated: true,
    bio: 'Experienced full-stack developer with 5+ years of expertise in building scalable web applications. I specialize in React, Node.js, and cloud technologies. Passionate about clean code and user experience.',
    skills: [
      { name: 'React', proficiency: 'expert', category: 'Frontend' },
      { name: 'Node.js', proficiency: 'expert', category: 'Backend' },
      { name: 'TypeScript', proficiency: 'expert', category: 'Programming' },
      { name: 'MongoDB', proficiency: 'advanced', category: 'Database' },
      { name: 'AWS', proficiency: 'advanced', category: 'Cloud' },
      { name: 'Docker', proficiency: 'intermediate', category: 'DevOps' },
      { name: 'GraphQL', proficiency: 'advanced', category: 'API' },
      { name: 'Next.js', proficiency: 'expert', category: 'Framework' }
    ],
    experience: [
      {
        id: '1',
        company: 'TechCorp Inc.',
        position: 'Senior Full Stack Developer',
        startDate: '2022-01',
        endDate: null,
        description: 'Lead development of enterprise web applications using React and Node.js',
        achievements: [
          'Reduced application load time by 40% through optimization',
          'Mentored 3 junior developers',
          'Implemented CI/CD pipeline reducing deployment time by 60%'
        ]
      },
      {
        id: '2',
        company: 'StartupXYZ',
        position: 'Full Stack Developer',
        startDate: '2020-03',
        endDate: '2021-12',
        description: 'Developed and maintained multiple client projects',
        achievements: [
          'Built 15+ client applications',
          'Achieved 100% client satisfaction rate',
          'Reduced bug reports by 50%'
        ]
      }
    ],
    education: [
      {
        id: '1',
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2016-09',
        endDate: '2020-06',
        description: 'Graduated with honors, specialized in software engineering'
      }
    ],
    languages: [
      { name: 'English', level: 'native' },
      { name: 'Spanish', level: 'conversational' }
    ],
    reviews: [
      {
        id: '1',
        clientName: 'John Smith',
        clientAvatar: '/avatar_olivia.jpg',
        rating: 5,
        date: '2024-03-15',
        text: 'Alex is an exceptional developer. He delivered our e-commerce platform ahead of schedule and exceeded all expectations. His attention to detail and communication skills are outstanding.',
        projectTitle: 'E-commerce Platform Development',
        projectValue: 8500
      },
      {
        id: '2',
        clientName: 'Sarah Wilson',
        clientAvatar: '/avatar_olivia.jpg',
        rating: 5,
        date: '2024-02-28',
        text: 'Working with Alex was a pleasure. He understood our requirements perfectly and delivered a robust solution. Highly recommended for any web development project.',
        projectTitle: 'CRM System Development',
        projectValue: 12000
      },
      {
        id: '3',
        clientName: 'Mike Johnson',
        clientAvatar: '/avatar_olivia.jpg',
        rating: 4,
        date: '2024-01-20',
        text: 'Great developer with strong technical skills. The project was completed successfully and on time. Would definitely work with again.',
        projectTitle: 'Mobile App Backend',
        projectValue: 6500
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Williams',
    title: 'UI/UX Designer',
    location: 'London, UK',
    avatar: '/avatar_olivia.jpg',
    rating: 4.8,
    reviewCount: 93,
    hourlyRate: 55,
    totalEarned: 18000,
    completionRate: 96,
    responseTime: '< 2 hours',
    lastActive: '1 day ago',
    isVerified: true,
    isTopRated: false,
    bio: 'Creative UI/UX designer with 4 years of experience crafting beautiful and functional user interfaces. I focus on user-centered design principles and creating memorable brand experiences.',
    skills: [
      { name: 'Figma', proficiency: 'expert', category: 'Design Tools' },
      { name: 'Adobe XD', proficiency: 'advanced', category: 'Design Tools' },
      { name: 'UI Design', proficiency: 'expert', category: 'Design' },
      { name: 'Wireframing', proficiency: 'expert', category: 'Design' },
      { name: 'Prototyping', proficiency: 'advanced', category: 'Design' },
      { name: 'User Research', proficiency: 'intermediate', category: 'Research' },
      { name: 'Brand Design', proficiency: 'advanced', category: 'Design' },
      { name: 'Design Systems', proficiency: 'intermediate', category: 'Design' }
    ],
    experience: [
      {
        id: '1',
        company: 'Design Studio London',
        position: 'Senior UI/UX Designer',
        startDate: '2021-06',
        endDate: null,
        description: 'Lead designer for multiple client projects across various industries',
        achievements: [
          'Designed 20+ successful mobile and web applications',
          'Improved user engagement by 35% through UX optimization',
          'Created comprehensive design systems for 3 major brands'
        ]
      },
      {
        id: '2',
        company: 'Creative Agency',
        position: 'UI Designer',
        startDate: '2020-01',
        endDate: '2021-05',
        description: 'Focused on creating intuitive user interfaces for web applications',
        achievements: [
          'Completed 30+ design projects',
          'Achieved 95% client satisfaction rate',
          'Reduced user onboarding time by 25%'
        ]
      }
    ],
    education: [
      {
        id: '1',
        institution: 'Royal College of Art',
        degree: 'Master of Arts',
        field: 'Design',
        startDate: '2018-09',
        endDate: '2020-06',
        description: 'Specialized in digital design and user experience'
      }
    ],
    languages: [
      { name: 'English', level: 'native' },
      { name: 'French', level: 'fluent' }
    ],
    reviews: [
      {
        id: '1',
        clientName: 'Emma Davis',
        clientAvatar: '/avatar_olivia.jpg',
        rating: 5,
        date: '2024-03-10',
        text: 'Sarah\'s design work is absolutely stunning. She transformed our app\'s user experience completely. The new design is both beautiful and functional.',
        projectTitle: 'Mobile App Redesign',
        projectValue: 7200
      },
      {
        id: '2',
        clientName: 'David Brown',
        clientAvatar: '/avatar_olivia.jpg',
        rating: 4,
        date: '2024-02-15',
        text: 'Great designer with excellent communication skills. The website design exceeded our expectations and helped increase our conversion rate.',
        projectTitle: 'Website Design',
        projectValue: 4800
      }
    ]
  }
];

export const getFreelancerProfile = (id: string): FreelancerProfile | undefined => {
  return mockFreelancerProfiles.find(profile => profile.id === id);
};
