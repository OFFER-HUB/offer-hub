import { NextRequest, NextResponse } from 'next/server';
import { 
  generateUserData, 
  generateContractData, 
  generateReviewData, 
  SEEDING_CONFIG,
  delay
} from '@/lib/seeding/data-generators';

// ⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
// Moved production check to inside the handler functions

interface DatabaseClient {
  query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>;
}

// Simular cliente de BD - reemplaza con tu cliente real (Supabase, etc.)
const getDatabaseClient = async (): Promise<DatabaseClient> => {
  // TODO: Implementar conexión real a la BD
  // Ejemplo para Supabase:
  // const { createClient } = require('@supabase/supabase-js');
  // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  // return supabase;
  
  // Mock para desarrollo
  return {
    query: async (sql: string, params?: any[]) => {
      console.log('Mock DB Query:', sql.substring(0, 100), '...', params?.slice(0, 3));
      return { 
        rows: [{ id: 'mock-id-' + Math.random().toString(36).substring(7) }] 
      };
    }
  };
};

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: 'Seeding endpoints are not available in production' },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    const { 
      users = SEEDING_CONFIG.USERS_TO_CREATE,
      clearExisting = false,
      dryRun = false
    } = body;

    const db = await getDatabaseClient();
    const results = {
      usersCreated: 0,
      contractsCreated: 0,
      reviewsCreated: 0,
      errors: [] as string[]
    };

    console.log('🌱 Starting database seeding...');
    console.log(`📊 Config: ${users} users, clearExisting: ${clearExisting}, dryRun: ${dryRun}`);

    // 1. Limpiar datos existentes si se solicita
    if (clearExisting && !dryRun) {
      console.log('🧹 Clearing existing data...');
      await db.query('DELETE FROM reviews WHERE created_at > NOW() - INTERVAL \'1 day\'');
      await db.query('DELETE FROM contracts WHERE created_at > NOW() - INTERVAL \'1 day\'');
      await db.query('DELETE FROM users WHERE created_at > NOW() - INTERVAL \'1 day\' AND wallet_address LIKE \'0x%seed%\'');
    }

    // 2. Crear usuarios
    console.log('👥 Creating users...');
    const createdUsers: any[] = [];
    const freelancers: any[] = [];
    const clients: any[] = [];

    for (let i = 0; i < users; i++) {
      const isFreelancer = Math.random() < SEEDING_CONFIG.FREELANCERS_PERCENTAGE;
      const userData = generateUserData(isFreelancer);
      userData.wallet_address = userData.wallet_address + '_seed_' + Date.now(); // Marcar como seed data

      if (!dryRun) {
        try {
          const result = await db.query(`
            INSERT INTO users (wallet_address, username, name, email, is_freelancer, bio)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, is_freelancer
          `, [
            userData.wallet_address,
            userData.username,
            userData.name,
            userData.email,
            userData.is_freelancer,
            userData.bio
          ]);

          const user = result.rows[0];
          createdUsers.push(user);
          
          if (isFreelancer) {
            freelancers.push(user);
          } else {
            clients.push(user);
          }

          results.usersCreated++;
        } catch (error) {
          results.errors.push(`Error creating user ${userData.username}: ${error}`);
        }
      }

      // Delay para no sobrecargar la BD
      if (i % 10 === 0) {
        await delay(100);
      }
    }

    console.log(`✅ Created ${results.usersCreated} users (${freelancers.length} freelancers, ${clients.length} clients)`);

    // 3. Crear contratos
    console.log('📝 Creating contracts...');
    const createdContracts: any[] = [];

    for (const freelancer of freelancers) {
      const contractCount = Math.floor(
        Math.random() * (SEEDING_CONFIG.CONTRACTS_PER_FREELANCER.max - SEEDING_CONFIG.CONTRACTS_PER_FREELANCER.min + 1)
      ) + SEEDING_CONFIG.CONTRACTS_PER_FREELANCER.min;

      for (let i = 0; i < contractCount; i++) {
        if (clients.length === 0) break;
        
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const contractData = generateContractData(randomClient.id, freelancer.id);

        if (!dryRun) {
          try {
            const result = await db.query(`
              INSERT INTO contracts (contract_type, freelancer_id, client_id, contract_on_chain_id, escrow_status, amount_locked)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id, freelancer_id, client_id
            `, [
              contractData.contract_type,
              contractData.freelancer_id,
              contractData.client_id,
              contractData.contract_on_chain_id,
              contractData.escrow_status,
              contractData.amount_locked
            ]);

            createdContracts.push(result.rows[0]);
            results.contractsCreated++;
          } catch (error) {
            results.errors.push(`Error creating contract: ${error}`);
          }
        }
      }

      await delay(50);
    }

    console.log(`✅ Created ${results.contractsCreated} contracts`);

    // 4. Crear reviews
    console.log('⭐ Creating reviews...');
    
    for (const contract of createdContracts) {
      // Solo crear review si el random está dentro de la probabilidad
      if (Math.random() > SEEDING_CONFIG.REVIEW_PROBABILITY) continue;

      const reviewData = generateReviewData(
        contract.client_id,
        contract.freelancer_id,
        contract.id
      );

      if (!dryRun) {
        try {
          await db.query(`
            INSERT INTO reviews (from_user_id, to_user_id, contract_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            reviewData.from_id, // from_id -> from_user_id en BD
            reviewData.to_id,   // to_id -> to_user_id en BD
            reviewData.contract_id,
            reviewData.rating,
            reviewData.comment
          ]);

          results.reviewsCreated++;
        } catch (error) {
          results.errors.push(`Error creating review: ${error}`);
        }
      }

      if (results.reviewsCreated % 20 === 0) {
        await delay(100);
      }
    }

    console.log(`✅ Created ${results.reviewsCreated} reviews`);

    // 5. Estadísticas finales
    const summary = {
      success: true,
      message: dryRun ? 'Dry run completed successfully' : 'Database seeded successfully',
      data: {
        ...results,
        config: {
          totalUsers: users,
          freelancersCreated: freelancers.length,
          clientsCreated: clients.length,
          averageContractsPerFreelancer: Math.round(results.contractsCreated / Math.max(freelancers.length, 1)),
          reviewRate: `${Math.round((results.reviewsCreated / Math.max(results.contractsCreated, 1)) * 100)}%`
        }
      },
      timestamp: new Date().toISOString()
    };

    console.log('🎉 Seeding completed!', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Seeding failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: 'Seeding endpoints are not available in production' },
      { status: 403 }
    );
  }
  
  return NextResponse.json({
    message: 'Seeding API is available',
    usage: 'POST /api/seed with body: { users: number, clearExisting: boolean, dryRun: boolean }',
    environment: process.env.NODE_ENV
  });
}