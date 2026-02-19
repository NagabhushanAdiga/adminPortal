import { getDb } from '../db.js';

export async function create({ studentIds, message }) {
  const db = await getDb();
  await db.collection('notifications').insertOne({
    student_ids: studentIds,
    message,
    sent_at: new Date(),
  });
}

export async function createMany(rows) {
  const db = await getDb();
  let sent = 0;
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const studentIds = (row.studentIds ?? row.student_ids ?? '').toString().trim();
    const message = (row.message ?? '').toString().trim();
    await db.collection('notifications').insertOne({
      student_ids: studentIds,
      message,
      sent_at: new Date(),
    });
    sent++;
  }
  return sent;
}

export async function findAll(limit = 500) {
  const db = await getDb();
  const docs = await db
    .collection('notifications')
    .find({})
    .sort({ sent_at: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => ({
    id: d._id.toString(),
    studentIds: d.student_ids,
    message: d.message,
    sentAt: d.sent_at,
  }));
}
