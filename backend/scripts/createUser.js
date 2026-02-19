import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import * as User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const [username, password, name, role] = process.argv.slice(2);

async function run() {
  if (!username || !password) {
    console.log('Usage: node scripts/createUser.js <username> <password> [name] [role]');
    console.log('Example: node scripts/createUser.js john secret123 "John Doe" Admin');
    process.exit(1);
  }

  const displayName = name || username;
  const userRole = role || 'Admin';

  try {
    const hash = await bcrypt.hash(password, 10);
    await User.upsertAdmin({
      username: username.trim(),
      passwordHash: hash,
      name: displayName,
      role: userRole,
    });
    console.log('User created/updated:', username);
    console.log('  Name:', displayName, '| Role:', userRole);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

run();
