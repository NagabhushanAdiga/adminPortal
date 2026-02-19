import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'adminportal';

async function check() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    console.log('MongoDB connected successfully. Database:', dbName);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
  process.exit(0);
}

check();
