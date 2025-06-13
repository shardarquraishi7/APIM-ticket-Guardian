import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';
import * as schema from './schema';

config({ path: '.env.local' });

const isDevelopment = process.env.NODE_ENV === 'development';
const certPath = path.join(process.cwd(), 'sia');

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

async function createDb() {
  if (!db) {
    if (isDevelopment) {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL!,
      });

      db = drizzle(pool, { schema });

      // Test local connection
      try {
        await db.execute(sql`SELECT NOW()`);
        console.log('✅ Local database connection successful');
      } catch (error) {
        console.error('❌ Failed to connect to local database:', error);
        throw error;
      }
    } else {
      const { SIA_DB_USER, SIA_DB_NAME, SIA_DB_PASSWORD, SIA_DB_PORT, SIA_DB_HOST } = process.env;

      const connectionString = `postgresql://${SIA_DB_USER}:${SIA_DB_PASSWORD}@${SIA_DB_HOST}:${SIA_DB_PORT}/${SIA_DB_NAME}`;

      const pool = new Pool({
        connectionString,
        max: 5,
        ssl: {
          rejectUnauthorized: false,
          ca: fs.readFileSync(path.join(certPath, 'sia_ca_cert.pem'), 'utf-8'),
          key: fs.readFileSync(path.join(certPath, 'sia_key.pem'), 'utf-8'),
          cert: fs.readFileSync(path.join(certPath, 'sia_cert.pem'), 'utf-8'),
        },
      });

      // Test production connection
      try {
        await pool.query('SELECT NOW()');
        console.log('✅ Production database connection successful');
      } catch (error) {
        console.error('❌ Failed to connect to production database:', error);
        throw error;
      }

      db = drizzle(pool, { schema });
    }
  }
  return db;
}

// Lazy singleton getter
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call createDb() first');
  }
  return db;
}

export type DbClient = Awaited<ReturnType<typeof createDb>>;

export { createDb, getDb, db };
