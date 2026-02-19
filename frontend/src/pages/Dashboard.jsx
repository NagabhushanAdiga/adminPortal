import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Chip,
} from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import People from '@mui/icons-material/People';
import PersonAdd from '@mui/icons-material/PersonAdd';
import MenuBook from '@mui/icons-material/MenuBook';
import UploadFile from '@mui/icons-material/UploadFile';
import Notifications from '@mui/icons-material/Notifications';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Schedule from '@mui/icons-material/Schedule';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const cardConfig = [
  { key: 'totalStudents', title: 'Total Students', icon: People, color: '#0d9488', gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', cardBg: 'linear-gradient(145deg, #ccfbf1 0%, #99f6e4 40%, #5eead4 100%)', format: (v) => String(v) },
  { key: 'enrolledThisMonth', title: 'Enrolled This Month', icon: PersonAdd, color: '#7c3aed', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', cardBg: 'linear-gradient(145deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)', format: (v) => String(v) },
  { key: 'activeCourses', title: 'Active Courses', icon: MenuBook, color: '#ea580c', gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', cardBg: 'linear-gradient(145deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)', format: (v) => String(v) },
  { key: 'attendanceRate', title: 'Attendance Rate', icon: TrendingUp, color: '#059669', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', cardBg: 'linear-gradient(145deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)', format: (v) => (typeof v === 'string' ? v : v + '%') },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);

  const displayName = user?.name || user?.username || 'Admin';

  useEffect(() => {
    let cancelled = false;
    api.getDashboardStats()
      .then((data) => {
        if (!cancelled && data.ok && data.stats) setStats(data.stats);
      })
      .catch(() => {
        if (!cancelled) setStats({ totalStudents: 0, enrolledThisMonth: 0, activeCourses: 0, attendanceRate: '0%' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.notificationsList()
      .then((data) => {
        if (!cancelled && data.ok && Array.isArray(data.rows)) setRecentNotifications(data.rows.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setNotifLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const statValues = stats || { totalStudents: 0, enrolledThisMonth: 0, activeCourses: 0, attendanceRate: '0%' };

  return (
    <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto',
          minHeight: '100%',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 35%, #fff 100%)',
          borderRadius: 2,
        }}
    >
      {/* Welcome header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'text.primary',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: 1.2,
          }}
        >
          {getGreeting()}, <Box component="span" sx={{ background: 'linear-gradient(90deg, #0d9488, #7c3aed)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>{displayName}</Box>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
          Here&apos;s what&apos;s happening with your portal today.
        </Typography>
      </Box>

      {/* Stats cards */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1.2, color: 'text.secondary', fontSize: '0.7rem' }}>
          Overview
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mt: 1.5, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {cardConfig.map((stat, index) => {
            const Icon = stat.icon;
            const value = statValues[stat.key] ?? 0;
            const displayValue = stat.format ? stat.format(value) : String(value);
            return (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ minWidth: { md: 0 } }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.06)',
                    background: stat.cardBg,
                    boxShadow: `0 4px 20px ${stat.color}20`,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 40px ${stat.color}30, 0 8px 20px rgba(0,0,0,0.08)`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, pt: 3, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            mb: 1,
                            fontSize: '0.7rem',
                          }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          fontWeight="800"
                          sx={{
                            fontSize: { xs: '1.875rem', sm: '2.25rem' },
                            lineHeight: 1.15,
                            color: 'text.primary',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {displayValue}
                        </Typography>
                        <Chip label="Live" size="small" variant="outlined" sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.65rem', height: 22 }} color="primary" />
                      </Box>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: stat.gradient,
                          color: '#fff',
                          boxShadow: `0 10px 24px ${stat.color}45`,
                        }}
                      >
                        <Icon sx={{ fontSize: 28 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Quick actions + Recent notifications */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={5}>
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1.2, color: 'text.secondary', fontSize: '0.7rem' }}>
            Quick actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1.5 }}>
            <Grid item xs={12} sm={6}>
              <Card
                component={Button}
                onClick={() => navigate('/import')}
                fullWidth
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.25)',
                    '& .quick-action-icon': { bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' },
                    '& .quick-action-arrow': { opacity: 1, transform: 'translateX(4px)' },
                  },
                }}
              >
                <Box className="quick-action-icon" sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadFile sx={{ fontSize: 26 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Import data</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>Upload JSON and save to database</Typography>
                </Box>
                <ArrowForward className="quick-action-arrow" sx={{ opacity: 0.6, transition: 'all 0.2s' }} />
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                component={Button}
                onClick={() => navigate('/notification')}
                fullWidth
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'secondary.main',
                    borderColor: 'secondary.main',
                    color: 'secondary.contrastText',
                    boxShadow: '0 8px 24px rgba(156, 39, 176, 0.25)',
                    '& .quick-action-icon': { bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' },
                    '& .quick-action-arrow': { opacity: 1, transform: 'translateX(4px)' },
                  },
                }}
              >
                <Box className="quick-action-icon" sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'secondary.light', color: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Notifications sx={{ fontSize: 26 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Send notification</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>Push messages to students</Typography>
                </Box>
                <ArrowForward className="quick-action-arrow" sx={{ opacity: 0.6, transition: 'all 0.2s' }} />
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={7}>
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1.2, color: 'text.secondary', fontSize: '0.7rem' }}>
            Recent notifications
          </Typography>
          <Card
            elevation={0}
            sx={{
              mt: 1.5,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            {notifLoading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={28} />
              </Box>
            ) : recentNotifications.length === 0 ? (
              <Box sx={{ py: 4, px: 2, textAlign: 'center' }}>
                <Notifications sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                <Typography color="text.secondary">No notifications sent yet</Typography>
                <Button variant="contained" size="small" onClick={() => navigate('/notification')} sx={{ mt: 2 }}>
                  Send your first
                </Button>
              </Box>
            ) : (
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {recentNotifications.map((row, i) => (
                  <Box
                    component="li"
                    key={row.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      py: 2,
                      px: 2.5,
                      borderBottom: i < recentNotifications.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Schedule sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {row.sentAt ? new Date(row.sentAt).toLocaleString() : '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.25 }} noWrap>
                        {row.message || '—'}
                      </Typography>
                      {row.studentIds && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          To: {row.studentIds}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                <Box sx={{ px: 2.5, pb: 2, pt: 1 }}>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/notification')}>
                    View all
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
