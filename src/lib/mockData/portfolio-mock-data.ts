export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  image: string;
  clientName: string;
  projectValue: number;
  completionDate: string;
  duration: string;
  features: string[];
  challenges: string[];
  results: string[];
}

export const mockPortfolioProjects: PortfolioProject[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'A comprehensive e-commerce platform built with modern technologies. Features include user authentication, product catalog, shopping cart, payment processing, and admin dashboard.',
    category: 'Web Development',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
    image: '/portfolio/ecommerce-platform.jpg',
    clientName: 'TechStore Inc.',
    projectValue: 8500,
    completionDate: '2024-03-15',
    duration: '3 months',
    features: [
      'User authentication and authorization',
      'Product catalog with search and filtering',
      'Shopping cart and checkout process',
      'Payment processing with Stripe',
      'Admin dashboard for inventory management',
      'Order tracking and notifications',
      'Responsive design for mobile and desktop'
    ],
    challenges: [
      'Complex payment integration with multiple gateways',
      'Real-time inventory management',
      'Performance optimization for large product catalogs',
      'Security implementation for payment processing'
    ],
    results: [
      '40% increase in conversion rate',
      '60% reduction in cart abandonment',
      '99.9% uptime achieved',
      'Mobile traffic increased by 150%'
    ]
  },
  {
    id: '2',
    title: 'Mobile Banking App',
    description: 'A modern mobile banking application designed for seamless user experience. Features include account management, fund transfers, bill payments, and financial analytics.',
    category: 'Mobile Development',
    technologies: ['React Native', 'Node.js', 'PostgreSQL', 'Firebase', 'Plaid API'],
    image: '/portfolio/mobile-banking.jpg',
    clientName: 'Digital Bank',
    projectValue: 12000,
    completionDate: '2024-02-28',
    duration: '4 months',
    features: [
      'Secure user authentication with biometric login',
      'Real-time account balance and transaction history',
      'Fund transfers between accounts',
      'Bill payment system',
      'Financial analytics and spending insights',
      'Push notifications for transactions',
      'Dark mode support'
    ],
    challenges: [
      'Implementing secure financial transactions',
      'Real-time data synchronization',
      'Cross-platform compatibility',
      'Compliance with banking regulations'
    ],
    results: [
      '50% increase in mobile app usage',
      '30% reduction in customer support calls',
      '95% user satisfaction rating',
      'Successfully passed security audits'
    ]
  },
  {
    id: '3',
    title: 'CRM System',
    description: 'A comprehensive Customer Relationship Management system designed for sales teams. Features include lead management, contact tracking, sales pipeline, and reporting.',
    category: 'Web Development',
    technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis', 'Docker'],
    image: '/portfolio/crm-system.jpg',
    clientName: 'SalesForce Pro',
    projectValue: 15000,
    completionDate: '2024-01-20',
    duration: '5 months',
    features: [
      'Lead and contact management',
      'Sales pipeline tracking',
      'Email integration and automation',
      'Advanced reporting and analytics',
      'Team collaboration tools',
      'Custom workflow automation',
      'API integration capabilities'
    ],
    challenges: [
      'Complex data relationships and reporting',
      'Real-time collaboration features',
      'Email automation system',
      'Scalability for large datasets'
    ],
    results: [
      '35% increase in sales productivity',
      '25% improvement in lead conversion',
      'Reduced data entry time by 40%',
      'Improved team collaboration by 60%'
    ]
  },
  {
    id: '4',
    title: 'Travel Booking Platform',
    description: 'A modern travel booking platform with flight, hotel, and car rental booking capabilities. Features include search, booking, payment, and itinerary management.',
    category: 'Web Development',
    technologies: ['Angular', 'Spring Boot', 'PostgreSQL', 'Redis', 'AWS'],
    image: '/portfolio/travel-booking.jpg',
    clientName: 'Wanderlust Travel',
    projectValue: 18000,
    completionDate: '2023-12-10',
    duration: '6 months',
    features: [
      'Flight, hotel, and car rental search',
      'Advanced filtering and sorting options',
      'Secure booking and payment processing',
      'Itinerary management and sharing',
      'Real-time pricing and availability',
      'Multi-language support',
      'Mobile-responsive design'
    ],
    challenges: [
      'Integration with multiple third-party APIs',
      'Real-time pricing and availability updates',
      'Complex booking flow optimization',
      'Multi-currency support'
    ],
    results: [
      '45% increase in booking conversion',
      '30% reduction in booking abandonment',
      'Improved user experience scores by 40%',
      'Successfully launched in 5 countries'
    ]
  },
  {
    id: '5',
    title: 'Fitness Tracking App',
    description: 'A comprehensive fitness tracking application with workout planning, progress tracking, and social features. Includes both mobile app and web dashboard.',
    category: 'Mobile Development',
    technologies: ['Flutter', 'Firebase', 'Node.js', 'MongoDB', 'AWS'],
    image: '/portfolio/fitness-app.jpg',
    clientName: 'FitLife',
    projectValue: 9500,
    completionDate: '2023-11-15',
    duration: '4 months',
    features: [
      'Workout planning and tracking',
      'Progress monitoring with charts',
      'Social features and challenges',
      'Nutrition tracking',
      'Wearable device integration',
      'Personalized recommendations',
      'Community features'
    ],
    challenges: [
      'Integration with multiple wearable devices',
      'Real-time data synchronization',
      'Complex workout algorithm implementation',
      'Social features and gamification'
    ],
    results: [
      '60% increase in user engagement',
      '40% improvement in user retention',
      'Average workout duration increased by 25%',
      'Successfully integrated with 10+ wearable devices'
    ]
  },
  {
    id: '6',
    title: 'Restaurant Management System',
    description: 'A complete restaurant management solution including POS, inventory management, online ordering, and analytics dashboard.',
    category: 'Web Development',
    technologies: ['React', 'Django', 'PostgreSQL', 'Redis', 'Stripe'],
    image: '/portfolio/restaurant-system.jpg',
    clientName: 'DineSmart',
    projectValue: 11000,
    completionDate: '2023-10-20',
    duration: '3 months',
    features: [
      'Point of Sale (POS) system',
      'Inventory management',
      'Online ordering and delivery',
      'Table reservations',
      'Kitchen display system',
      'Analytics and reporting',
      'Customer loyalty program'
    ],
    challenges: [
      'Real-time order management',
      'Inventory synchronization',
      'Payment processing integration',
      'Multi-location support'
    ],
    results: [
      '25% increase in order efficiency',
      '30% reduction in food waste',
      '20% increase in customer satisfaction',
      'Streamlined operations across 3 locations'
    ]
  }
];

export const getPortfolioProjects = (freelancerId: string): PortfolioProject[] => {
  // In a real app, this would filter by freelancer ID
  // For now, return all projects
  return mockPortfolioProjects;
};

export const getPortfolioProject = (projectId: string): PortfolioProject | undefined => {
  return mockPortfolioProjects.find(project => project.id === projectId);
};
