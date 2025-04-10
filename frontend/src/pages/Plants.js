import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Checkbox,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FenceIcon from '@mui/icons-material/Fence';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { getPlantsAPI, createPlantAPI, updatePlantAPI, deletePlantAPI, createPlantingAPI } from '../services/api';

function Plants() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentPlant, setCurrentPlant] = useState(null);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '',
    seedlings: '',
    transplant: '',
    harvest: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [plantingDetailsOpen, setPlantingDetailsOpen] = useState(false);
  const [plantingDetails, setPlantingDetails] = useState({
    seedlings: '',
    planted: ''
  });
  const currentYear = new Date().getFullYear();

  const categories = ['green', 'tomato', 'pepper', 'vegetable', 'herb', 'flower'];

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const data = await getPlantsAPI();
      setPlants(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError('Failed to load plants. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, plant = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && plant) {
      setCurrentPlant(plant);
      setFormData({
        name: plant.name,
        category: plant.category,
        type: plant.type || '',
        seedlings: plant.seedlings || '',
        transplant: plant.transplant || '',
        harvest: plant.harvest || ''
      });
    } else {
      setCurrentPlant(null);
      setFormData({
        name: '',
        category: '',
        type: '',
        seedlings: '',
        transplant: '',
        harvest: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : parseInt(value, 10);
    setFormData({
      ...formData,
      [name]: numValue
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.category) {
        setSnackbar({
          open: true,
          message: 'Name and category are required',
          severity: 'error'
        });
        return;
      }

      // Prepare data for API
      const plantData = {
        name: formData.name,
        category: formData.category,
        type: formData.type || null,
        seedlings: formData.seedlings === '' ? null : parseInt(formData.seedlings, 10),
        transplant: formData.transplant === '' ? null : parseInt(formData.transplant, 10),
        harvest: formData.harvest === '' ? null : parseInt(formData.harvest, 10)
      };

      if (dialogMode === 'add') {
        await createPlantAPI(plantData);
        setSnackbar({
          open: true,
          message: 'Plant added successfully',
          severity: 'success'
        });
      } else {
        await updatePlantAPI(currentPlant.id, plantData);
        setSnackbar({
          open: true,
          message: 'Plant updated successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchPlants();
    } catch (err) {
      console.error('Error saving plant:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${dialogMode === 'add' ? 'add' : 'update'} plant`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plant?')) {
      return;
    }

    try {
      await deletePlantAPI(id);
      setSnackbar({
        open: true,
        message: 'Plant deleted successfully',
        severity: 'success'
      });
      fetchPlants();
    } catch (err) {
      console.error('Error deleting plant:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete plant',
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
  
  const handleSelectPlant = (id) => {
    setSelectedPlants(prev => {
      if (prev.includes(id)) {
        return prev.filter(plantId => plantId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allPlantIds = plants.map(plant => plant.id);
      setSelectedPlants(allPlantIds);
    } else {
      setSelectedPlants([]);
    }
  };
  
  const handleOpenPlantingDetails = () => {
    if (selectedPlants.length === 0) {
      return;
    }
    // Reset planting details
    setPlantingDetails({
      seedlings: '',
      planted: ''
    });
    setPlantingDetailsOpen(true);
  };
  
  const handleClosePlantingDetails = () => {
    setPlantingDetailsOpen(false);
  };
  
  const handlePlantingDetailsChange = (e) => {
    const { name, value } = e.target;
    setPlantingDetails({
      ...plantingDetails,
      [name]: value
    });
  };
  
  const handleCreatePlantings = async () => {
    if (selectedPlants.length === 0) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Close the dialog
      setPlantingDetailsOpen(false);
      
      // Create plantings for each selected plant
      const plantingPromises = selectedPlants.map(plantId => {
        // Only include non-empty values in the payload
        const plantingData = {
          year: currentYear,
          plant_id: plantId,
          planted: plantingDetails.planted || null
        };
        
        // Only add seedlings to payload if a value was provided
        if (plantingDetails.seedlings) {
          plantingData.seedlings = plantingDetails.seedlings;
        }
        
        return createPlantingAPI(plantingData);
      });
      
      await Promise.all(plantingPromises);
      
      setSnackbar({
        open: true,
        message: `Successfully created ${selectedPlants.length} plantings for ${currentYear}`,
        severity: 'success'
      });
      
      // Redirect to Plantings page
      navigate('/plantings', { 
        state: { 
          year: currentYear, 
          message: `${selectedPlants.length} plants added to your garden for ${currentYear}` 
        } 
      });
      
      // Clear selection
      setSelectedPlants([]);
      
    } catch (err) {
      console.error('Error creating plantings:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create plantings. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">Plants</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedPlants.length > 0 && (
            <Tooltip title={`Add ${selectedPlants.length} selected plants to your garden for ${currentYear}`}>
              <Button
                variant="contained"
                color="success"
                startIcon={<FenceIcon />}
                onClick={handleOpenPlantingDetails}
                sx={{ color: 'white' }}
              >
                Add {selectedPlants.length} plants to your garden
              </Button>
            </Tooltip>
          )}
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            sx={{ color: 'white' }}
          >
            Add Plant
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate('/import')}
          >
            Import
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedPlants.length > 0 && selectedPlants.length < plants.length}
                  checked={plants.length > 0 && selectedPlants.length === plants.length}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all plants' }}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              {/* <TableCell>Type</TableCell> */}
              <TableCell>Start Seedlings</TableCell>
              <TableCell>Plant Outdoors</TableCell>
              <TableCell>Harvest</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No plants found. Add your first plant to get started!
                </TableCell>
              </TableRow>
            ) : (
              plants.map((plant) => (
                <TableRow 
                  key={plant.id}
                  selected={selectedPlants.includes(plant.id)}
                  hover
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedPlants.includes(plant.id)}
                      onChange={() => handleSelectPlant(plant.id)}
                      inputProps={{ 'aria-labelledby': `plant-${plant.id}` }}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row" id={`plant-${plant.id}`}>
                    <Button
                      component={RouterLink}
                      to={`/plants/${plant.id}`}
                      color="success"
                      sx={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0' }}
                    >
                      {plant.name}
                    </Button>
                  </TableCell>
                  <TableCell>{plant.category}</TableCell>
                  {/* <TableCell>{plant.type || '-'}</TableCell> */}
                  <TableCell>
                    {plant.seedlings !== null ? 
                      `${Math.abs(plant.seedlings)} days ${plant.seedlings < 0 ? 'before' : 'after'} last frost` : 
                      '-'}
                  </TableCell>
                  <TableCell>
                    {plant.transplant !== null ? 
                      `${Math.abs(plant.transplant)} days ${plant.transplant < 0 ? 'before' : 'after'} last frost` : 
                      '-'}
                  </TableCell>
                  <TableCell>
                    {plant.harvest !== null ? `${plant.harvest} days to maturity` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="success" 
                      onClick={() => handleOpenDialog('edit', plant)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(plant.id)}
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

      {/* Add/Edit Plant Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Plant' : 'Edit Plant'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Plant Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleInputChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              id="type"
              label="Type (optional)"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="seedlings"
              label="Start Seedlings (days before/after last frost)"
              name="seedlings"
              type="number"
              value={formData.seedlings}
              onChange={handleNumberChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="transplant"
              label="Plant Outdoors (days before/after last frost)"
              name="transplant"
              type="number"
              value={formData.transplant}
              onChange={handleNumberChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="harvest"
              label="Harvest (days to maturity)"
              name="harvest"
              type="number"
              value={formData.harvest}
              onChange={handleNumberChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="success" sx={{ color: 'white' }}>
            {dialogMode === 'add' ? 'Add Plant' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Planting Details Dialog */}
      <Dialog open={plantingDetailsOpen} onClose={handleClosePlantingDetails} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Planting Details (Optional)
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter optional dates for the {selectedPlants.length} selected plants. 
              These values will be applied to all plants being added to your garden.
              You can modify individual plants and add locations later in the garden view.
            </Typography>
            
            <TextField
              margin="normal"
              fullWidth
              id="seedlings"
              label="Start Seedlings Date (optional)"
              name="seedlings"
              type="date"
              value={plantingDetails.seedlings}
              onChange={handlePlantingDetailsChange}
              InputLabelProps={{ shrink: true }}
              helperText="Date when you started (or plan to start) seedlings indoors"
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="planted"
              label="Plant Outdoors Date (optional)"
              name="planted"
              type="date"
              value={plantingDetails.planted}
              onChange={handlePlantingDetailsChange}
              InputLabelProps={{ shrink: true }}
              helperText="Date when you planted (or plan to plant) outside"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlantingDetails}>Cancel</Button>
          <Button onClick={handleCreatePlantings} variant="contained" color="success" sx={{ color: 'white' }}>
            Add to Garden
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

export default Plants;