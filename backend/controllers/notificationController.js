import * as Notification from '../models/Notification.js';

export async function send(req, res) {
  try {
    const { rows } = req.body || {};
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.json({ ok: true, sent: 0, pushed: 0 });
    }
    const sent = await Notification.createMany(rows);
    res.json({ ok: true, sent, pushed: 0 });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}

export async function list(req, res) {
  try {
    const rows = await Notification.findAll(500);
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
