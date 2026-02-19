import { getDb } from '../db.js';

/** Lightweight check: server is reachable (no DB). Use for "backend unreachable" detection. */
export async function ping(req, res) {
  res.json({ ok: true });
}

export async function checkHealth(req, res) {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    res.json({ ok: true, connected: true, message: 'MongoDB connected' });
  } catch (err) {
    res.status(503).json({
      ok: false,
      connected: false,
      error: err.message || 'MongoDB connection failed',
    });
  }
}
