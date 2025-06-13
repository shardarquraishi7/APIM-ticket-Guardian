import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseError, Pool } from 'pg';
import { repos } from './schema';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  console.log('Seeding database...');

  try {
    await db.insert(repos).values([
      {
        name: 'identity-docs',
      },
      {
        name: 'api-marketplace-guide',
      },
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.constraint === 'repos_name_unique') {
        console.log('Database already seeded');
      } else {
        console.error('Database Error: ', error);
      }
    } else {
      console.error('Error seeding database:', error);
    }
  } finally {
    await pool.end();
  }
}

main();
