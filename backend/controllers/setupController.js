import bcrypt from 'bcryptjs';
import * as User from '../models/User.js';

export async function runSetup(req, res) {
  try {
    const username = 'admin';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    const name = 'Admin User';
    const role = 'Admin';
    await User.upsertAdmin({ username, passwordHash: hash, name, role });
    res.json({
      ok: true,
      message: 'Admin user ready. Username: admin, Password: admin123',
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Database error' });
  }
}
