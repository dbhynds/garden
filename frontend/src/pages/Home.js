import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Paper 
} from '@mui/material';
import EcoIcon from '@mui/icons-material/Eco';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

function Home() {
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h1" gutterBottom>
          Welcome to Garden Planner
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Track your plants and plantings to optimize your garden
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EcoIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h2">
                  Plants
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Add and manage your plants with details like category, type, and growth timeline.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                component={RouterLink}
                to="/plants"
                startIcon={<EcoIcon />}
              >
                View Plants
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonthIcon color="secondary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h2">
                  Plantings
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Track when and where you planted, with seedling start dates and planting locations.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary"
                component={RouterLink}
                to="/plantings"
                startIcon={<CalendarMonthIcon />}
              >
                View Plantings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, bgcolor: '#f9f9f9' }}>
        <Typography variant="h6" gutterBottom>Getting Started</Typography>
        <Typography variant="body1">
          1. Add your plants to the system with their details.<br />
          2. Record when and where you planted them.<br />
          3. Track your garden's progress throughout the season.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Home;