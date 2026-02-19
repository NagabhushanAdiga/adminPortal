import * as User from '../models/User.js';

export async function list(req, res) {
  try {
    const users = await User.list();
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
