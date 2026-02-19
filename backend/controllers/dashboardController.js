import * as ImportData from '../models/ImportData.js';

export async function getStats(req, res) {
  try {
    const totalStudents = await ImportData.count();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const dateStr = monthStart.toISOString().slice(0, 19).replace('T', ' ');
    const enrolledThisMonth = await ImportData.countSince(dateStr);
    res.json({
      ok: true,
      stats: {
        totalStudents,
        enrolledThisMonth,
        activeCourses: 0,
        attendanceRate: '0%',
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
