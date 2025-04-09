import React, { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  getPlantsAPI, 
  getPlantingsAPI, 
  createPlantingAPI, 
  updatePlantingAPI, 
  deletePlantingAPI 
} from '../services/api';
import { format } from 'date-fns';

function Plantings() {
  const location = useLocation();
  const [plantings, setPlantings] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentPlanting, setCurrentPlanting] = useState(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    plant_id: '',
    seedlings: '',
    planted: '',
    location: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [filterYear]);

  useEffect(() => {
    // Check if we're redirected from plant details with intention to add a planting
    if (location.state?.addPlanting) {
      const { plant_id } = location.state.addPlanting;
      setFormData({
        ...formData,
        plant_id
      });
      handleOpenDialog('add');
    }
  }, [location]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch plants for the dropdown
      const plantsData = await getPlantsAPI();
      setPlants(plantsData);
      
      // Fetch plantings filtered by year
      const plantingsData = await getPlantingsAPI({ year: filterYear });
      setPlantings(plantingsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, planting = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && planting) {
      setCurrentPlanting(planting);
      setFormData({
        year: planting.year,
        plant_id: planting.plant_id,
        seedlings: planting.seedlings ? format(new Date(planting.seedlings), 'yyyy-MM-dd') : '',
        planted: planting.planted ? format(new Date(planting.planted), 'yyyy-MM-dd') : '',
        location: planting.location || ''
      });
    } else {
      setCurrentPlanting(null);
      setFormData({
        year: new Date().getFullYear(),
        plant_id: location.state?.addPlanting?.plant_id || '',
        seedlings: '',
        planted: '',
        location: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Clear location state if it exists
    if (location.state?.addPlanting) {
      window.history.replaceState({}, document.title);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.year || !formData.plant_id) {
        setSnackbar({
          open: true,
          message: 'Year and plant are required',
          severity: 'error'
        });
        return;
      }

      // Prepare data for API
      const plantingData = {
        year: parseInt(formData.year, 10),
        plant_id: parseInt(formData.plant_id, 10),
        seedlings: formData.seedlings || null,
        planted: formData.planted || null,
        location: formData.location || null
      };

      if (dialogMode === 'add') {
        await createPlantingAPI(plantingData);
        setSnackbar({
          open: true,
          message: 'Planting added successfully',
          severity: 'success'
        });
      } else {
        await updatePlantingAPI(currentPlanting.id, plantingData);
        setSnackbar({
          open: true,
          message: 'Planting updated successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchData();
    } catch (err) {
      console.error('Error saving planting:', err);
      setSnackbar({
        open: true,
        message: \`Failed to \${dialogMode === 'add' ? 'add' : 'update'} planting\`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this planting?')) {
      return;
    }

    try {
      await deletePlantingAPI(id);
      setSnackbar({
        open: true,
        message: 'Planting deleted successfully',
        severity: 'success'
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting planting:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete planting',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const getPlantName = (plantId) => {
    const plant = plants.find(p => p.id === plantId);
    return plant ? plant.name : 'Unknown Plant';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 5 + i
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">Plantings</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Planting
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="body1">Filter by Year:</Typography>
          </Grid>
          <Grid item>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                displayEmpty
                size="small"
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plant</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Seedlings Started</TableCell>
              <TableCell>Planted Outside</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plantings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No plantings found for {filterYear}. Add your first planting to get started!
                </TableCell>
              </TableRow>
            ) : (
              plantings.map((planting) => (
                <TableRow key={planting.id}>
                  <TableCell component="th" scope="row">
                    <Button
                      component={RouterLink}
                      to={`/plants/${planting.plant_id}`}
                      color="primary"
                      sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      {getPlantName(planting.plant_id)}
                    </Button>
                  </TableCell>
                  <TableCell>{planting.location || '-'}</TableCell>
                  <TableCell>
                    {planting.seedlings
                      ? format(new Date(planting.seedlings), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {planting.planted
                      ? format(new Date(planting.planted), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog('edit', planting)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(planting.id)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Planting Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Planting' : 'Edit Planting'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="year"
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="plant-label">Plant</InputLabel>
              <Select
                labelId="plant-label"
                id="plant_id"
                name="plant_id"
                value={formData.plant_id}
                label="Plant"
                onChange={handleInputChange}
              >
                {plants.map((plant) => (
                  <MenuItem key={plant.id} value={plant.id}>
                    {plant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              id="location"
              label="Location (optional)"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Garden Bed 1, Container 3"
            />
            <TextField
              margin="normal"
              fullWidth
              id="seedlings"
              label="Seedlings Start Date (optional)"
              name="seedlings"
              type="date"
              value={formData.seedlings}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="planted"
              label="Planting Date (optional)"
              name="planted"
              type="date"
              value={formData.planted}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add Planting' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Plantings;