import * as ImportData from '../models/ImportData.js';

export async function save(req, res) {
  try {
    const { rows } = req.body || {};
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.json({ ok: true, saved: 0 });
    }
    const saved = await ImportData.createMany(rows);
    res.json({ ok: true, saved });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}

export async function list(req, res) {
  try {
    const rows = await ImportData.findAll();
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
