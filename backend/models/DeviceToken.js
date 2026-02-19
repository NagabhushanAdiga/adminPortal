import { getDb } from '../db.js';

export async function upsert(identifier, fcmToken) {
  const db = await getDb();
  await db.collection('device_tokens').updateOne(
    { fcm_token: fcmToken },
    {
      $set: {
        identifier,
        fcm_token: fcmToken,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function updateByIdentifier(identifier, fcmToken) {
  const db = await getDb();
  await db.collection('device_tokens').updateMany(
    { fcm_token: fcmToken },
    { $set: { identifier, updatedAt: new Date() } }
  );
}
