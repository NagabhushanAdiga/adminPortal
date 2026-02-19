import { getDb } from '../db.js';

export async function create(data) {
  const db = await getDb();
  await db.collection('import_data').insertOne({
    data,
    created_at: new Date(),
  });
}

export async function createMany(rows) {
  const db = await getDb();
  let saved = 0;
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const clean = { ...row };
    delete clean._rowId;
    await db.collection('import_data').insertOne({
      data: clean,
      created_at: new Date(),
    });
    saved++;
  }
  return saved;
}

export async function findAll() {
  const db = await getDb();
  const docs = await db
    .collection('import_data')
    .find({})
    .sort({ created_at: -1 })
    .toArray();
  return docs.map((d) => ({
    ...d.data,
    id: d._id.toString(),
    _created_at: d.created_at,
  }));
}

export async function count() {
  const db = await getDb();
  return db.collection('import_data').countDocuments();
}

export async function countSince(date) {
  const db = await getDb();
  const d = date instanceof Date ? date : new Date(date);
  return db.collection('import_data').countDocuments({ created_at: { $gte: d } });
}
