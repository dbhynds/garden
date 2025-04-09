import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { getPlantAPI, getPlantingsAPI } from '../services/api';
import { format } from 'date-fns';

function PlantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [plantings, setPlantings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const plantData = await getPlantAPI(id);
        setPlant(plantData);

        // Fetch plantings for this plant
        const plantingsData = await getPlantingsAPI({ plant_id: id });
        setPlantings(plantingsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load plant details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/plants')}
          sx={{ mt: 2 }}
        >
          Back to Plants
        </Button>
      </Box>
    );
  }

  if (!plant) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">Plant not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/plants')}
          sx={{ mt: 2 }}
        >
          Back to Plants
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/plants"
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h1" sx={{ flexGrow: 1 }}>
          {plant.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          component={RouterLink}
          to={`/plants/${plant.id}`}
          onClick={(e) => {
            e.preventDefault();
            navigate('/plants', { state: { editPlant: plant } });
          }}
        >
          Edit
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plant Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ width: 120, fontWeight: 'bold' }}>
                  Category:
                </Typography>
                <Typography variant="body1">
                  {plant.category.charAt(0).toUpperCase() + plant.category.slice(1)}
                </Typography>
              </Box>
              
              {plant.type && (
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ width: 120, fontWeight: 'bold' }}>
                    Type:
                  </Typography>
                  <Typography variant="body1">{plant.type}</Typography>
                </Box>
              )}
              
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Growing Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {plant.seedlings !== null && (
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ width: 120, fontWeight: 'bold' }}>
                    Seedlings:
                  </Typography>
                  <Typography variant="body1">
                    {plant.seedlings} days {plant.seedlings < 0 ? 'before' : 'after'} last frost
                  </Typography>
                </Box>
              )}
              
              {plant.transplant !== null && (
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ width: 120, fontWeight: 'bold' }}>
                    Transplant:
                  </Typography>
                  <Typography variant="body1">
                    {plant.transplant} days {plant.transplant < 0 ? 'before' : 'after'} last frost
                  </Typography>
                </Box>
              )}
              
              {plant.harvest !== null && (
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ width: 120, fontWeight: 'bold' }}>
                    Harvest:
                  </Typography>
                  <Typography variant="body1">
                    {plant.harvest} days to maturity
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  Plantings
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  component={RouterLink}
                  to="/plantings"
                  state={{ addPlanting: { plant_id: plant.id } }}
                >
                  Add Planting
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {plantings.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No plantings recorded for this plant yet.
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {plantings.map((planting) => (
                    <Paper key={planting.id} sx={{ mb: 2, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {planting.year} Season
                      </Typography>
                      
                      {planting.location && (
                        <Typography variant="body2">
                          Location: {planting.location}
                        </Typography>
                      )}
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {planting.seedlings && (
                          <Grid item xs={6}>
                            <Typography variant="caption" display="block" color="textSecondary">
                              Seedlings Started
                            </Typography>
                            <Typography variant="body2">
                              {format(new Date(planting.seedlings), 'MMM d, yyyy')}
                            </Typography>
                          </Grid>
                        )}
                        
                        {planting.planted && (
                          <Grid item xs={6}>
                            <Typography variant="caption" display="block" color="textSecondary">
                              Planted Outside
                            </Typography>
                            <Typography variant="body2">
                              {format(new Date(planting.planted), 'MMM d, yyyy')}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PlantDetails;