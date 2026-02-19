import { getDb } from '../db.js';

export async function findByUsername(username) {
  const db = await getDb();
  const user = await db.collection('users').findOne(
    { username: username.trim() },
    { projection: { _id: 1, username: 1, password_hash: 1, name: 1, role: 1 } }
  );
  if (!user) return null;
  return {
    id: user._id.toString(),
    username: user.username,
    password_hash: user.password_hash,
    name: user.name,
    role: user.role,
  };
}

export async function upsertAdmin({ username, passwordHash, name, role }) {
  const db = await getDb();
  await db.collection('users').updateOne(
    { username },
    {
      $set: {
        username,
        password_hash: passwordHash,
        name,
        role,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
