import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { api } from '../api';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .notificationsList()
      .then((data) => {
        if (!cancelled && data.ok && Array.isArray(data.rows)) setNotifications(data.rows);
        else if (!cancelled) setNotifications([]);
      })
      .catch(() => { if (!cancelled) setNotifications([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <Card sx={{ overflow: 'auto' }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Activity and notification history from the backend.
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
              <Typography color="text.secondary">No report data yet. Send notifications to see activity here.</Typography>
            </Box>
          ) : (
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {notifications.slice(0, 50).map((row) => (
                <Box
                  component="li"
                  key={row.id}
                  sx={{
                    py: 1.5,
                    px: 0,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <Typography variant="body2">{row.message || '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.sentAt ? new Date(row.sentAt).toLocaleString() : '—'}
                    {row.studentIds ? ` · To: ${row.studentIds}` : ''}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {notifications.length > 50 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Showing latest 50 of {notifications.length} notifications.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
