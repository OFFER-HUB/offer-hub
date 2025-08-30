export interface Skill {
  name: string
  color: string
}

export interface Talent {
  id: number
  name: string
  title: string
  location: string
  category: string
  rating: number
  hourlyRate: number
  avatar: string
  skills: Skill[]
  description: string
  actionText: string
}

export interface PortfolioItem {
  id: number
  title: string
  description: string
  image: string
  date: string
  category: string
}

export interface Review {
  id: number
  clientName: string
  rating: number
  comment: string
  date: string
  projectTitle?: string
}

export interface TalentProfile extends Talent {
  bio: string
  experience: string
  education: string
  languages: string[]
  availability: string
  responseTime: string
  completedProjects: number
  portfolio: PortfolioItem[]
  reviews: Review[]
}

export const talentProfileData: TalentProfile[] = [
  {
    id: 1,
    name: "John D",
    title: "UI/UX designer | Brand designer | Figma pro",
    location: "Canada",
    category: "Design",
    rating: 4.8,
    hourlyRate: 85,
    avatar: "/avatar.png",
    skills: [
      { name: "UI/UX", color: "bg-slate-600" },
      { name: "Design", color: "bg-red-500" },
      { name: "Figma", color: "bg-purple-500" },
      { name: "Product design", color: "bg-blue-400" },
      { name: "Framer", color: "bg-yellow-200 text-black" },
    ],
    description:
      "I am a UI/UX designer with 4 years of experience in creating user-friendly interfaces and enhancing user experiences. My passion lies in understanding user needs and translating them into intuitive designs that drive engagement and satisfaction.",
    actionText: "Message",
    bio: "I am a UI/UX designer with 4 years of experience in creating user-friendly interfaces and enhancing user experiences. My passion lies in understanding user needs and translating them into intuitive designs that drive engagement and satisfaction. I specialize in mobile app design, web applications, and brand identity creation.",
    experience: "4+ years",
    education: "Bachelor's in Graphic Design, University of Toronto",
    languages: ["English", "French"],
    availability: "Available now",
    responseTime: "Within 2 hours",
    completedProjects: 127,
    portfolio: [
      {
        id: 1,
        title: "Mobile app design",
        description: "E-commerce mobile application with modern UI",
        image: "/mobile-app-design.png",
        date: "August 2024",
        category: "Mobile Design",
      },
      {
        id: 1,
        title: "Mobile app design",
        description: "E-commerce mobile application with modern UI",
        image: "/mobile-app-design2.png",
        date: "August 2024",
        category: "Mobile Design",
      },
      {
        id: 2,
        title: "Website design",
        description: "Corporate website redesign with improved UX",
        image: "/website-design.png",
        date: "August 2024",
        category: "Web Design",
      },
      {
        id: 3,
        title: "Landing page design",
        description: "SaaS landing page with conversion optimization",
        image: "/landing-page.png",
        date: "August 2024",
        category: "Landing Page",
      },
      {
        id: 4,
        title: "Dashboard design",
        description: "Analytics dashboard with data visualization",
        image: "/dashboard-design.png",
        date: "August 2024",
        category: "Dashboard",
      },
      {
        id: 4,
        title: "Dashboard design",
        description: "Analytics dashboard with data visualization",
        image: "/dashboard-design1.png",
        date: "August 2024",
        category: "Dashboard",
      },
    ],
    reviews: [
      {
        id: 1,
        clientName: "John Doe",
        rating: 5,
        comment:
          "Very helpful, and insightful. We look forward to a long lasting relationship with Mohsin and his team of lead generation experts.",
        date: "march 20, 2024",
        projectTitle: "E-commerce App Design",
      },
      {
        id: 2,
        clientName: "Alex Smith",
        rating: 5,
        comment:
          "Incredibly useful and enlightening. We are excited about building a lasting partnership with Sarah and her team of marketing specialists.",
        date: "April 15, 2025",
        projectTitle: "Website Redesign",
      },
      {
        id: 3,
        clientName: "Emily Johnson",
        rating: 5,
        comment:
          "Incredibly useful and enlightening. We are excited about building a lasting partnership with Sarah and her team of marketing specialists.",
        date: "April 15, 2025",
        projectTitle: "Brand Identity Design",
      },
    ],
  },
  {
    id: 2,
    name: "Alex R",
    title: "Creative Designer | Visual Artist | Figma Specialist",
    location: "Australia",
    category: "Design",
    rating: 4.9,
    hourlyRate: 95,
    avatar: "/avatar.png",
    skills: [
      { name: "User Experience", color: "bg-gray-500" },
      { name: "Creative Solutions", color: "bg-red-500" },
      { name: "Sketch", color: "bg-purple-500" },
      { name: "Interface Design", color: "bg-blue-400" },
      { name: "Webflow", color: "bg-yellow-200 text-black" },
    ],
    description:
      "I am a UI/UX designer with four years of experience in crafting user-centric interfaces and improving overall user experiences. I thrive on identifying user requirements and transforming them into seamless designs that enhance engagement.",
    actionText: "Contact Me",
    bio: "Creative designer with a passion for visual storytelling and user-centered design. I specialize in creating compelling digital experiences that balance aesthetics with functionality.",
    experience: "4+ years",
    education: "Master's in Digital Design, RMIT University",
    languages: ["English"],
    availability: "Available in 1 week",
    responseTime: "Within 4 hours",
    completedProjects: 89,
    portfolio: [
      {
        id: 1,
        title: "Brand Identity",
        description: "Complete brand identity for tech startup",
        image: "/brand-identity-design.png",
        date: "July 2024",
        category: "Branding",
      },
      {
        id: 2,
        title: "Mobile App UI",
        description: "Social media app interface design",
        image: "/social-media-app-ui.png",
        date: "June 2024",
        category: "Mobile Design",
      },
    ],
    reviews: [
      {
        id: 1,
        clientName: "Michael Brown",
        rating: 5,
        comment: "Outstanding work on our brand identity. Alex delivered beyond expectations.",
        date: "June 10, 2024",
        projectTitle: "Brand Identity Project",
      },
    ],
  },
  {
    id: 3,
    name: "Jordan T",
    title: "Innovative Creator | Digital Artist | Figma Expert",
    location: "New Zealand",
    category: "Design",
    rating: 4.7,
    hourlyRate: 75,
    avatar: "/avatar.png",
    skills: [
      { name: "User Interaction", color: "bg-gray-500" },
      { name: "Inventive Strategies", color: "bg-red-500" },
      { name: "Adobe XD", color: "bg-purple-500" },
      { name: "User Interface Development", color: "bg-blue-400" },
      { name: "Squarespace", color: "bg-yellow-200 text-black" },
    ],
    description:
      "I am a UI/UX designer with five years of experience in creating user-focused interfaces and enhancing overall user satisfaction. I excel at understanding user needs and translating them into intuitive designs that boost engagement and satisfaction.",
    actionText: "Get in Touch",
    bio: "",
    experience: "",
    education: "",
    languages: [],
    availability: "",
    responseTime: "",
    completedProjects: 0,
    portfolio: [],
    reviews: [],
  },
  {
    id: 4,
    name: "Sarah M",
    title: "Full Stack Developer | React Specialist",
    location: "United States",
    category: "Development",
    rating: 4.9,
    hourlyRate: 120,
    avatar: "/avatar.png",
    skills: [
      { name: "React", color: "bg-gray-500" },
      { name: "Node.js", color: "bg-red-500" },
      { name: "Python", color: "bg-purple-500" },
      { name: "Full Stack", color: "bg-blue-400" },
      { name: "TypeScript", color: "bg-yellow-200 text-black" },
    ],
    description:
      "Experienced full-stack developer with 6 years of expertise in React, Node.js, and Python. I specialize in building scalable web applications and have a passion for clean, maintainable code...",
    actionText: "Hire Now",
    bio: "",
    experience: "",
    education: "",
    languages: [],
    availability: "",
    responseTime: "",
    completedProjects: 0,
    portfolio: [],
    reviews: [],
  },
  {
    id: 5,
    name: "Mike L",
    title: "SEO Expert | Content Strategist",
    location: "United Kingdom",
    category: "Marketing",
    rating: 4.6,
    hourlyRate: 65,
    avatar: "/avatar.png",
    skills: [
      { name: "SEO", color: "bg-gray-500" },
      { name: "Content Writing", color: "bg-red-500" },
      { name: "Social Media", color: "bg-purple-500" },
      { name: "Analytics", color: "bg-blue-400" },
      { name: "Strategy", color: "bg-yellow-200 text-black" },
    ],
    description:
      "Digital marketing specialist with 5 years of experience in SEO optimization and content strategy. I help businesses improve their online visibility and drive organic traffic through data-driven approaches...",
    actionText: "Connect",
    bio: "",
    experience: "",
    education: "",
    languages: [],
    availability: "",
    responseTime: "",
    completedProjects: 0,
    portfolio: [],
    reviews: [],
  },
  {
    id: 6,
    name: "Emma K",
    title: "Technical Writer | Documentation Specialist",
    location: "Germany",
    category: "Writing",
    rating: 4.5,
    hourlyRate: 55,
    avatar: "/avatar.png",
    skills: [
      { name: "Technical Writing", color: "bg-gray-500" },
      { name: "Documentation", color: "bg-red-500" },
      { name: "Content Strategy", color: "bg-purple-500" },
      { name: "API Documentation", color: "bg-blue-400" },
      { name: "User Guides", color: "bg-yellow-200 text-black" },
    ],
    description:
      "Professional technical writer with 3 years of experience creating clear, user-friendly documentation for software products. I specialize in API documentation, user guides, and developer resources...",
    actionText: "Collaborate",
    bio: "",
    experience: "",
    education: "",
    languages: [],
    availability: "",
    responseTime: "",
    completedProjects: 0,
    portfolio: [],
    reviews: [],
  },
  {
    id: 7,
    name: "David C",
    title: "Business Consultant | Strategy Expert",
    location: "France",
    category: "Consulting",
    rating: 4.8,
    hourlyRate: 150,
    avatar: "/avatar.png",
    skills: [
      { name: "Business Strategy", color: "bg-gray-500" },
      { name: "Market Research", color: "bg-red-500" },
      { name: "Financial Analysis", color: "bg-purple-500" },
      { name: "Process Optimization", color: "bg-blue-400" },
      { name: "Leadership", color: "bg-yellow-200 text-black" },
    ],
    description:
      "Senior business consultant with 8 years of experience helping startups and enterprises optimize their operations and growth strategies. I focus on data-driven solutions and sustainable business models...",
    actionText: "Consult",
    bio: "",
    experience: "",
    education: "",
    languages: [],
    availability: "",
    responseTime: "",
    completedProjects: 0,
    portfolio: [],
    reviews: [],
  },
  {
    id: 8,
    name: "Lisa P",
    title: "Portrait Photographer | Event Specialist",
    location: "Netherlands",
    category: "Photography",
    rating: 4.7,
    hourlyRate: 80,
    avatar: "/avatar.png",
    skills: [
      { name: "Portrait Photography", color: "bg-gray-500" },
      { name: "Event Photography", color: "bg-red-500" },
      { name: "Photo Editing", color: "bg-purple-500" },
      { name: "Lightroom", color: "bg-blue-400" },
      { name: "Creative Direction", color: "bg-yellow-200 text-black" },
    ],
    description:
      "Professional photographer with 5 years of experience in portrait and event photography. I have a keen eye for capturing authentic moments and creating compelling visual stories...",
    actionText: "Book Session",
    bio: "",
    experience: "",
    education: "",
    languages: [],
    availability: "",
    responseTime: "",
    completedProjects: 0,
    portfolio: [],
    reviews: [],
  },
]
