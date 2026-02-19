import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [volume, setVolume] = useState(70);
  const [language, setLanguage] = useState('en');

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                color="primary"
              />
            }
            label="Email notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                color="primary"
              />
            }
            label="Dark mode"
          />
        </CardContent>
      </Card>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Volume
          </Typography>
          <Slider
            value={volume}
            onChange={(_, v) => setVolume(v)}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            sx={{ maxWidth: 300 }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Language
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          <Button variant="contained">Save changes</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
