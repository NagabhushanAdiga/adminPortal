import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = (process.env.MONGODB_URI || 'mongodb://localhost:27017').trim();
const dbName = (process.env.DB_NAME || 'adminportal').trim();

let client = null;
let db = null;

export async function getDb() {
  if (db) return db;
  if (!uri || uri.includes('<') || uri.includes('xxxxx')) {
    throw new Error('MONGODB_URI is not set or is a placeholder. Set it in .env or Vercel Environment Variables.');
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export default { getDb, closeDb };
