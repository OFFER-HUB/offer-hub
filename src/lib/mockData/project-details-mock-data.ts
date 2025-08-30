export interface ProjectDetail {
  id: string
  title: string
  date: string
  description: string
  mainImages: string[]
  additionalImages: string[]
  category: string
  tools: string[]
  duration: string
  client?: string
}

export const projectDetailsData: ProjectDetail[] = [
  {
    id: "1",
    title: "Mobile app design",
    date: "August 2024",
    description:
      "Introducing the sleek and user-friendly design of our innovative crypto exchange mobile app, where you can effortlessly trade, track, and manage your digital assets with unparalleled ease. This app is not just a tool; it's your gateway to the world of cryptocurrency. It features real-time market data that keeps you informed about price fluctuations and trends, intuitive navigation that allows you to find what you need in seconds, and robust security measures that ensure your transactions are safe and secure. With advanced encryption and two-factor authentication, you can trade with confidence. Whether you're a seasoned investor looking to optimize your portfolio or just starting out on your crypto journey, our app is meticulously designed to meet your unique needs. It provides educational resources and market insights to help you make informed decisions, ensuring you stay ahead in the fast-paced and ever-evolving world of cryptocurrency. Join us today and experience the future of trading at your fingertips!",
    mainImages: [
      "/mobile-app-design.png",
    ],
    additionalImages: [
      "/project1.png",
      "/project2.png",
      "/project3.png",
      "/project4.png",
      "/project5.png",
      "/project6.png",
    ],
    category: "Mobile App Design",
    tools: ["Figma", "Sketch", "Principle", "Adobe XD"],
    duration: "3 months",
    client: "CryptoTech Solutions",
  },
  {
    id: "2",
    title: "Website design",
    date: "August 2024",
    description:
      "A comprehensive website design project focused on creating an engaging and user-friendly digital experience. This project involved extensive user research, wireframing, and prototyping to deliver a modern and responsive website that meets both user needs and business objectives.",
    mainImages: ["/mobile-app-design2.png"],
    additionalImages: [
      "/project1.png",
      "/project2.png",
      "/project3.png",
      "/project4.png",
      "/project5.png",
      "/project6.png",
    ],
    category: "Web Design",
    tools: ["Figma", "Adobe Photoshop", "Webflow"],
    duration: "2 months",
    client: "Digital Marketing Agency",
  },
  {
    id: "3",
    title: "Landing page design",
    date: "August 2024",
    description:
      "A high-converting landing page design created to maximize user engagement and conversion rates. The design focuses on clear messaging, compelling visuals, and strategic placement of call-to-action elements to guide users through the conversion funnel.",
    mainImages: ["/website-design.png"],
    additionalImages: ["/landing-page-testimonials.png", "/landing-page-pricing.png", "/landing-page-footer.png"],
    category: "Landing Page",
    tools: ["Figma", "Adobe Illustrator"],
    duration: "3 weeks",
    client: "SaaS Startup",
  },
  {
    id: "4",
    title: "Dashboard design",
    date: "August 2024",
    description:
      "An intuitive dashboard design that provides users with comprehensive data visualization and management capabilities. The design emphasizes clarity, functionality, and ease of use while handling complex data sets and multiple user workflows.",
    mainImages: ["/landing-page.png"],
    additionalImages: [
      "/project1.png",
      "/project2.png",
      "/project3.png",
      "/project4.png",
      "/project5.png",
      "/project6.png",
    ],
    category: "Dashboard Design",
    tools: ["Figma", "Sketch", "InVision"],
    duration: "4 months",
    client: "Analytics Platform",
  },
  {
    id: "5",
    title: "Dashboard design",
    date: "August 2024",
    description:
      "A modern and comprehensive dashboard interface designed for enterprise-level data management and analytics. This project focused on creating an intuitive user experience for complex data visualization and workflow management.",
    mainImages: [
      "/dashboard-design.png",
    ],
    additionalImages: [
      "/project1.png",
      "/project2.png",
      "/project3.png",
      "/project4.png",
      "/project5.png",
      "/project6.png",
    ],
    category: "Enterprise Dashboard",
    tools: ["Figma", "Adobe XD", "Principle"],
    duration: "5 months",
    client: "Enterprise Software Company",
  },
  {
    id: "6",
    title: "Mobile app design",
    date: "August 2024",
    description:
      "A sleek mobile application design focused on social networking and community building. The design emphasizes user engagement, intuitive navigation, and seamless social interactions while maintaining a modern and appealing visual aesthetic.",
    mainImages: [
      "/dashboard-design1.png",
    ],
    additionalImages: [
      "/project1.png",
      "/project2.png",
      "/project3.png",
      "/project4.png",
      "/project5.png",
      "/project6.png",
    ],
    category: "Social Mobile App",
    tools: ["Figma", "Sketch", "Framer"],
    duration: "4 months",
    client: "Social Media Startup",
  },
]
