import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb } from './index';

const main = async () => {
  try {
    const db = await createDb();
    await migrate(db, {
      migrationsFolder: 'src/db/migrations',
    });
    console.log('Database migrated successfully');
  } catch (error) {
    console.error('Error migrating database: ', error);
    process.exit(1);
  }
};

main();
