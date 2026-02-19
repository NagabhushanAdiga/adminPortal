import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Static reports data
const reportSummary = [
  { label: 'Monthly Revenue Report', progress: 100, date: 'Feb 2025' },
  { label: 'User Growth Report', progress: 85, date: 'Feb 2025' },
  { label: 'Sales by Region', progress: 72, date: 'Jan 2025' },
  { label: 'Inventory Audit', progress: 45, date: 'In progress' },
  { label: 'Quarterly Summary', progress: 30, date: 'Q1 2025' },
];

export default function Reports() {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <Card sx={{ overflow: 'auto' }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Report summary (static data)
          </Typography>
          <List>
            {reportSummary.map((report, index) => (
              <ListItem key={index} divider={index < reportSummary.length - 1}>
                <ListItemIcon>
                  {report.progress === 100 ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <AssessmentIcon color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={report.label}
                  secondary={report.date}
                />
                <Box sx={{ width: 120 }}>
                  <LinearProgress
                    variant="determinate"
                    value={report.progress}
                    color={report.progress === 100 ? 'success' : 'primary'}
                    sx={{ borderRadius: 1, height: 8 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2, minWidth: 40 }}>
                  {report.progress}%
                </Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
