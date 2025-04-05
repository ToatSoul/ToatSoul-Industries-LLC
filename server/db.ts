
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace('.us-east-1', '-pooler.us-east-1'),
  max: 10,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: true } : 
    undefined
});

// For checking connection health
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Create a Drizzle instance
export const db = drizzle(pool);

// Export pool for potential direct usage
export { pool };
