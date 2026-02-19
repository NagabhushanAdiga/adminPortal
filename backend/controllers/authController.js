import bcrypt from 'bcryptjs';
import * as User from '../models/User.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password required' });
    }
    const user = await User.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.json({ ok: false, error: 'Invalid username or password' });
    }
    res.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        role: user.role || 'Admin',
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
