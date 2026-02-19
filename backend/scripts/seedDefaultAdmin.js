import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import * as User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'adminportal';
  console.log(`Connecting to MongoDB (db: "${dbName}")...`);

  try {
    const username = 'admin';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    const name = 'Admin User';
    const role = 'Admin';
    await User.upsertAdmin({ username, passwordHash: hash, name, role });
    console.log('Default admin created. Username: admin, Password: admin123');
  } catch (err) {
    console.error('Seed failed:', err.message || err);
    if (err.name === 'MongoServerSelectionError' || err.code === 'ECONNREFUSED') {
      console.error('Cannot reach MongoDB. Check:');
      console.error('  1. .env exists in adminPortal/backend with MONGODB_URI and optionally DB_NAME');
      console.error('  2. MongoDB is running and reachable');
    } else if (err.code) {
      console.error('Code:', err.code);
    }
    process.exit(1);
  }
  process.exit(0);
}

seed();
