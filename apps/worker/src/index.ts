import { config } from 'dotenv';

config();

async function start() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`Worker running in ${env} mode`);

  // Placeholder for job processors.
  console.log('Waiting for jobs...');

  // Keep the process alive for development
  setInterval(() => { }, 1000 * 60 * 60);
}

start();
