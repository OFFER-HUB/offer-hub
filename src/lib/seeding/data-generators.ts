import { CreateReviewDTO } from '@/types/review.types';

// Datos realistas para generar reviews
const REALISTIC_REVIEWS = [
  {
    rating: 5,
    comments: [
      'Excelente trabajo! Muy profesional y entregó a tiempo. Definitivamente lo recomiendo.',
      'Trabajo excepcional, superó mis expectativas. Comunicación fluida durante todo el proyecto.',
      'Perfecto! Entrega impecable y atención al detalle. Volveré a trabajar con él sin duda.',
      'Increíble freelancer, muy talentoso y responsable. 100% recomendado.',
      'Outstanding work! Professional, on-time, and exceeded expectations. Will hire again!'
    ]
  },
  {
    rating: 4,
    comments: [
      'Muy buen trabajo, aunque hubo algunos retrasos menores. En general satisfecho.',
      'Buen freelancer, entrega de calidad pero la comunicación podría mejorar un poco.',
      'Trabajo sólido y profesional. Algunas revisiones menores pero nada crítico.',
      'Good work overall, minor revisions needed but delivered as promised.',
      'Satisfied with the work quality. Could be more responsive but delivered well.'
    ]
  },
  {
    rating: 3,
    comments: [
      'Trabajo aceptable pero necesitó varias revisiones. Cumplió al final.',
      'Entrega dentro del plazo pero la calidad no fue excepcional.',
      'Average work, met basic requirements but lacked attention to detail.',
      'Decent freelancer but communication could be better. Got the job done.',
      'Fair work, some issues that were resolved after feedback.'
    ]
  },
  {
    rating: 2,
    comments: [
      'Trabajo por debajo de las expectativas. Requirió muchas correcciones.',
      'No muy satisfecho con la entrega. Calidad mejorable.',
      'Work quality was below expectations. Required multiple revisions.',
      'Not satisfied with the delivery. Communication was poor.'
    ]
  },
  {
    rating: 1,
    comments: [
      'Muy decepcionante. No cumplió con lo acordado.',
      'Poor work quality and missed deadlines. Would not recommend.',
      'Terrible experience. Did not deliver as promised.'
    ]
  }
];

const CLIENT_NAMES = [
  'María González', 'Carlos Rodríguez', 'Ana Martínez', 'Diego López', 'Sofia Herrera',
  'Miguel Sánchez', 'Lucía Pérez', 'Andrés García', 'Elena Morales', 'Roberto Silva',
  'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
  'Lisa Anderson', 'Chris Taylor', 'Jessica Martinez', 'Daniel Garcia', 'Ashley Rodriguez'
];

const FREELANCER_NAMES = [
  'Alex Entwickler', 'Sam Designer', 'Jordan Coder', 'Casey Developer', 'Taylor Creator',
  'Morgan Builder', 'Riley Programmer', 'Avery Architect', 'Quinn Engineer', 'Sage Developer'
];

const PROJECT_TYPES = [
  'Desarrollo de aplicación web', 'Diseño de logo y branding', 'Desarrollo móvil iOS/Android',
  'Sitio web corporativo', 'E-commerce platform', 'Dashboard administrativo', 'Landing page',
  'API REST development', 'Database optimization', 'UI/UX design', 'Frontend development',
  'Backend integration', 'Full-stack application', 'WordPress site', 'React application'
];

// Función para generar un comentario aleatorio basado en el rating
export function generateRealisticComment(rating: number): string {
  const ratingComments = REALISTIC_REVIEWS.find(r => r.rating === rating);
  if (!ratingComments) return 'Great work!';
  
  const randomIndex = Math.floor(Math.random() * ratingComments.comments.length);
  return ratingComments.comments[randomIndex];
}

// Generar rating con distribución realista (más 4s y 5s)
export function generateRealisticRating(): number {
  // More conservative weights to ensure >85% are ratings 4-5
  // 1% rating 1, 2% rating 2, 10% rating 3, 30% rating 4, 57% rating 5
  const weights = [1, 2, 10, 30, 57]; 
  const random = Math.random() * 100;
  
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return i + 1;
    }
  }
  return 5; // fallback
}

// Generar fecha aleatoria en los últimos 6 meses
export function generateRandomDate(): Date {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
}

// Generar datos de usuario realistas
export function generateUserData(isFreelancer: boolean = false) {
  const names = isFreelancer ? FREELANCER_NAMES : CLIENT_NAMES;
  const randomName = names[Math.floor(Math.random() * names.length)];
  const username = randomName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
  const walletAddress = '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  return {
    wallet_address: walletAddress,
    username: username,
    name: randomName,
    email: `${username}@example.com`,
    is_freelancer: isFreelancer,
    bio: isFreelancer 
      ? `Experienced ${PROJECT_TYPES[Math.floor(Math.random() * PROJECT_TYPES.length)]} specialist`
      : `Looking for quality freelancers for ${PROJECT_TYPES[Math.floor(Math.random() * PROJECT_TYPES.length)]}`
  };
}

// Generar datos de contrato
export function generateContractData(clientId: string, freelancerId: string) {
  return {
    contract_type: 'service',
    freelancer_id: freelancerId,
    client_id: clientId,
    contract_on_chain_id: 'chain_' + Math.random().toString(36).substring(2, 15),
    escrow_status: 'released', // Para permitir reviews
    amount_locked: (Math.random() * 5000 + 100).toFixed(2) // Entre $100 y $5100
  };
}

// Generar review realista
export function generateReviewData(fromUserId: string, toUserId: string, contractId: string): CreateReviewDTO {
  const rating = generateRealisticRating();
  const comment = Math.random() > 0.05 ? generateRealisticComment(rating) : undefined; // 95% tienen comentario
  
  return {
    from_id: fromUserId, // Nota: El hook usa from_id pero la BD usa from_user_id
    to_id: toUserId,     // Nota: El hook usa to_id pero la BD usa to_user_id  
    contract_id: contractId,
    rating,
    comment
  };
}

// Configuración de seeding
export const SEEDING_CONFIG = {
  USERS_TO_CREATE: 50,
  FREELANCERS_PERCENTAGE: 0.4, // 40% freelancers, 60% clients
  CONTRACTS_PER_FREELANCER: { min: 5, max: 20 },
  REVIEW_PROBABILITY: 0.8, // 80% de contratos tienen review
};

// Función helper para delay en tests
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  generateRealisticComment,
  generateRealisticRating,
  generateRandomDate,
  generateUserData,
  generateContractData,
  generateReviewData,
  SEEDING_CONFIG,
  delay
};