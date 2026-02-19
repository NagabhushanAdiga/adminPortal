import * as DeviceToken from '../models/DeviceToken.js';

export async function register(req, res) {
  try {
    const identifier = (req.body?.identifier ?? '').toString().trim();
    const token = (req.body?.token ?? req.body?.fcm_token ?? '').toString().trim();
    if (!identifier || !token) {
      return res.status(400).json({
        ok: false,
        error:
          'Send JSON: { "identifier": "student_id_or_email", "token": "fcm_device_token" }',
      });
    }
    try {
      await DeviceToken.upsert(identifier, token);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        await DeviceToken.updateByIdentifier(identifier, token);
      } else {
        throw err;
      }
    }
    res.json({ ok: true, message: 'Device registered for push notifications' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Database error' });
  }
}
