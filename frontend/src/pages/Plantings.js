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
  Grid,
  Collapse,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SeedlingIcon from '@mui/icons-material/Spa';
import TransplantIcon from '@mui/icons-material/Grass';
import HarvestIcon from '@mui/icons-material/Agriculture';
import { 
  getPlantsAPI, 
  getPlantingsAPI, 
  createPlantingAPI, 
  updatePlantingAPI, 
  deletePlantingAPI 
} from '../services/api';
import { format, addDays } from 'date-fns';
import PlantingDates from '../components/PlantingDates';
import { calculatePlantingDates } from '../utils/dateCalculations';

// Helper functions to calculate recommended dates
const calculateSeedlingsDate = (plant, year) => {
  // April 18 is the last frost date
  const lastFrostDate = new Date(year, 3, 18); // Month is 0-indexed (3 = April)
  return addDays(lastFrostDate, plant.seedlings);
};

const calculateTransplantDate = (plant, year) => {
  // April 18 is the last frost date
  const lastFrostDate = new Date(year, 3, 18); // Month is 0-indexed (3 = April)
  return addDays(lastFrostDate, plant.transplant);
};

const calculateHarvestDate = (plant, planting, filterYear) => {
  // Harvest is calculated based on actual transplant date if available,
  // otherwise from calculated transplant date
  if (!plant.harvest) return null;
  
  let baseDate;
  if (planting.planted) {
    // Use actual transplant date if available
    baseDate = new Date(planting.planted);
  } else if (plant.transplant != null) {
    // Otherwise use the recommended transplant date
    const lastFrostDate = new Date(filterYear, 3, 18); // Month is 0-indexed (3 = April)
    baseDate = addDays(lastFrostDate, plant.transplant);
  } else {
    return null;
  }
  
  return addDays(baseDate, plant.harvest);
};

// Expandable row component
function Row(props) {
  const { planting, getPlantName, handleOpenDialog, handleDelete, filterYear } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <Tooltip title={open ? "Hide recommended dates" : "Show recommended dates based on this plant's frost data"}>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell>
          {planting.plant?.category ? (
            <Tooltip title={planting.plant.category}>
              <Chip
                label={planting.plant.category.charAt(0).toUpperCase()}
                size="small"
                color="success"
                sx={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              />
            </Tooltip>
          ) : '-'}
        </TableCell>
        <TableCell component="th" scope="row">
          <Button
            component={RouterLink}
            to={`/plants/${planting.plant_id}`}
            color="primary"
            sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            {getPlantName(planting)}
          </Button>
        </TableCell>
        <TableCell>
          {planting.seedlings ? (
            // Actual seedling date is set - show solid chip
            <Tooltip title="Actual date when seedlings were started">
              <Chip 
                icon={<SeedlingIcon sx={{ color: 'white' }} />} 
                label={format(new Date(planting.seedlings), 'MMM d, yyyy')}
                size="small"
                color="primary"
                sx={{ color: 'white' }}
              />
            </Tooltip>
          ) : planting.plant?.seedlings != null ? (
            // No actual date, but plant has seedling data - show recommended date with outline
            (() => {
              const recommendedDate = calculateSeedlingsDate(planting.plant, filterYear);
              const isPast = new Date() > recommendedDate;
              return (
                <Tooltip title={`Recommended date based on ${Math.abs(planting.plant.seedlings)} days ${planting.plant.seedlings < 0 ? 'before' : 'after'} last frost${isPast ? ' (overdue)' : ''}`}>
                  <Chip 
                    icon={<SeedlingIcon />} 
                    label={format(recommendedDate, 'MMM d, yyyy')}
                    size="small"
                    color={isPast ? "warning" : "primary"}
                    variant="outlined"
                  />
                </Tooltip>
              );
            })()
          ) : '-'}
        </TableCell>
        <TableCell>
          {planting.planted ? (
            // Actual transplant date is set - show solid chip
            <Tooltip title="Actual date when plants were transplanted outside">
              <Chip 
                icon={<TransplantIcon sx={{ color: 'white' }} />} 
                label={format(new Date(planting.planted), 'MMM d, yyyy')}
                size="small"
                color="primary"
                sx={{ color: 'white' }}
              />
            </Tooltip>
          ) : planting.plant?.transplant != null ? (
            // No actual date, but plant has transplant data - show recommended date with outline
            (() => {
              const recommendedDate = calculateTransplantDate(planting.plant, filterYear);
              const isPast = new Date() > recommendedDate;
              return (
                <Tooltip title={`Recommended date based on ${Math.abs(planting.plant.transplant)} days ${planting.plant.transplant < 0 ? 'before' : 'after'} last frost${isPast ? ' (overdue)' : ''}`}>
                  <Chip 
                    icon={<TransplantIcon />} 
                    label={format(recommendedDate, 'MMM d, yyyy')}
                    size="small"
                    color={isPast ? "warning" : "primary"}
                    variant="outlined"
                  />
                </Tooltip>
              );
            })()
          ) : '-'}
        </TableCell>
        <TableCell>
          {(() => {
            // Always calculate harvest date based on transplant date (actual or calculated)
            const recommendedDate = planting.plant?.harvest != null ? 
              calculateHarvestDate(planting.plant, planting, filterYear) : null;
              
            if (!recommendedDate) return '-';
            
            const isPast = new Date() > recommendedDate;
            const baseText = planting.planted ? 
              `Expected date based on actual transplant + ${planting.plant.harvest} days` :
              `Recommended date based on calculated transplant + ${planting.plant.harvest} days`;
              
            return (
              <Tooltip title={`${baseText}${isPast ? ' (overdue)' : ''}`}>
                <Chip 
                  icon={<HarvestIcon />} 
                  label={format(recommendedDate, 'MMM d, yyyy')}
                  size="small"
                  color={isPast ? "warning" : "success"}
                  variant="outlined"
                />
              </Tooltip>
            );
          })()}
        </TableCell>
        <TableCell>{planting.location || '-'}</TableCell>
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
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <PlantingDates plant={planting.plant} year={filterYear} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

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
    
    // Handle message from the Plants page after creating multiple plantings
    if (location.state?.message) {
      setSnackbar({
        open: true,
        message: location.state.message,
        severity: 'success'
      });
      
      // Set filter year if provided
      if (location.state?.year) {
        setFilterYear(location.state.year);
      }
      
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both data in parallel
      const [plantsData, plantingsData] = await Promise.all([
        // Fetch plants for the dropdown
        getPlantsAPI(),
        // Fetch plantings filtered by year
        getPlantingsAPI({ year: filterYear })
      ]);
      
      setPlants(plantsData);
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
        message: `Failed to ${dialogMode === 'add' ? 'add' : 'update'} planting`,
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

  // Get plant name from the planting object's plant property
  const getPlantName = (planting) => {
    return planting.plant ? planting.plant.name : 'Unknown Plant';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const years = Array.from(
    { length: nextYear - 2016 + 1 },
    (_, i) => 2016 + i
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">Your Garden</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
          sx={{ color: 'white' }}
        >
          Add to Garden
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
          <Grid item xs={12} sm={true}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Last Frost Date:</strong> April 18, {filterYear}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f8ff' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Tip:</strong> <b>Solid color chips</b> show your actual planting dates. <b>Outlined chips</b> show recommended dates based on ideal timing relative to last frost (April 18). <b>Orange chips</b> indicate recommended dates that have already passed. Click the arrow ↓ for more details about each plant's recommended schedule.
        </Typography>
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
              <TableCell width="50px" /> {/* Expansion control column */}
              <TableCell width="60px">Type</TableCell>
              <TableCell>Plant</TableCell>
              <TableCell>Seedling Date</TableCell>
              <TableCell>Transplant Date</TableCell>
              <TableCell>Estimated Harvest</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plantings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No plantings found for {filterYear}. Add your first planting to get started!
                </TableCell>
              </TableRow>
            ) : (
              plantings.map((planting) => (
                <Row 
                  key={planting.id} 
                  planting={planting} 
                  getPlantName={getPlantName} 
                  handleOpenDialog={handleOpenDialog} 
                  handleDelete={handleDelete}
                  filterYear={filterYear}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Planting Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add to Your Garden' : 'Edit Garden Entry'}
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
              InputProps={{ inputProps: { min: 2016, max: nextYear } }}
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
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ color: 'white' }}>
            {dialogMode === 'add' ? 'Add to Garden' : 'Save Changes'}
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