import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import School from '@mui/icons-material/School';
import Group from '@mui/icons-material/Group';
import Security from '@mui/icons-material/Security';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const infoPoints = [
  { icon: <Group />, title: 'Send to students', text: 'Import student IDs and messages via JSON, then send push notifications to their devices.' },
  { icon: <School />, title: 'JSON import', text: 'Upload a file or paste JSON with student IDs and message for each notification.' },
  { icon: <Security />, title: 'Admin only', text: 'Sign in with admin credentials to send notifications.' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendOk, setBackendOk] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    let cancelled = false;
    api.health().then((d) => { if (!cancelled) setBackendOk(d.ok && d.connected); }).catch(() => { if (!cancelled) setBackendOk(false); });
    return () => { cancelled = true; };
  }, []);

  const handleRunSetup = async () => {
    setSetupMessage('');
    setSetupLoading(true);
    try {
      const data = await api.setup();
      setSetupMessage(data.message || 'Default admin created. Use username: admin, password: admin123');
    } catch (e) {
      setSetupMessage(e.message || 'Setup failed');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: isSmall ? 'column' : 'row',
        overflow: 'auto',
      }}
    >
      {/* Left: Info panel — hidden on small screens or shown above form when stacked */}
      <Box
        sx={{
          flex: isSmall ? '0 0 auto' : '1 1 50%',
          minHeight: isSmall ? 'auto' : '100vh',
          background: 'linear-gradient(145deg, #0d47a1 0%, #1565c0 40%, #1976d2 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 5, lg: 6 },
          ...(isSmall && { py: 4, px: 3 }),
        }}
      >
        <Box sx={{ maxWidth: 480, mx: isSmall ? 0 : 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <AdminPanelSettings sx={{ fontSize: 42 }} />
            <Typography variant="h5" fontWeight="bold">
              Student Push Notifications
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.95, mb: 3, lineHeight: 1.6 }}>
            Sign in to send push notifications to students on their mobile devices. Admin access only.
          </Typography>
          {infoPoints.map((item, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                mb: 2,
                '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.9)', mt: 0.25 },
              }}
            >
              {item.icon}
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {item.text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right: Login form — full width on small screens */}
      <Box
        sx={{
          flex: isSmall ? '1 1 auto' : '1 1 50%',
          minHeight: isSmall ? 'auto' : '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: (t) => t.palette.grey[50],
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 2,
            boxShadow: { xs: 0, sm: 2 },
            border: (t) => (theme.palette.mode === 'light' ? `1px solid ${t.palette.grey[200]}` : 'none'),
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use your admin credentials to access the portal
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                autoComplete="username"
                autoFocus={!isSmall}
                size="medium"
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ mt: 3, mb: 1.5, py: 1.5 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            {backendOk === false && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Backend unreachable. Check VITE_API_URL and that the API is deployed and running.
              </Alert>
            )}
            {backendOk === true && (
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 1 }}>
                Backend connected
              </Typography>
            )}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                No admin yet? Create default admin (admin / admin123):
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={handleRunSetup}
                disabled={setupLoading || backendOk !== true}
                sx={{ mt: 0.5, textTransform: 'none' }}
              >
                {setupLoading ? 'Creating...' : 'Run setup'}
              </Button>
              {setupMessage && (
                <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>
                  {setupMessage}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
