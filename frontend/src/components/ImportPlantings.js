import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Divider,
  Chip,
  Collapse,
  IconButton,
  Paper,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getPlantsAPI, createPlantingAPI } from '../services/api';

const ImportPlantings = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [formatExpanded, setFormatExpanded] = useState(false);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample CSV content for the user to download
  const sampleCsvContent = `PlantName,Year,Seedlings,Planted,Location
Tomato,2023,2023-03-15,2023-05-01,Garden Bed 1
Basil,2023,,2023-05-15,Container 3
Broccoli,2023,2023-02-20,,Raised Bed 2`;

  useEffect(() => {
    // Fetch plants to use for matching by name
    const fetchPlants = async () => {
      try {
        const plants = await getPlantsAPI();
        setPlants(plants);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching plants:', err);
        setError('Error loading plant data. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setImportResults(null);
    
    if (selectedFile) {
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target.result;
        // Handle different types of line breaks (\n, \r, \r\n)
        const lines = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        
        // Get headers (first line)
        const headers = lines[0].split(',');
        
        if (!headers.includes('PlantName') || !headers.includes('Year')) {
          setError('CSV file must contain "PlantName" and "Year" columns');
          setParsedData(null);
          return;
        }
        
        const plantings = [];
        
        // Start from 1 to skip the header row
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',');
          if (values.length !== headers.length) {
            console.warn(`Line ${i+1} has incorrect number of columns. Expected ${headers.length}, got ${values.length}`);
            continue;
          }
          
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          
          // Check for required fields
          if (!row['PlantName'] || !row['Year']) {
            console.warn(`Line ${i+1} missing required fields (PlantName, Year)`);
            continue;
          }
          
          // Find matching plant by name
          const matchingPlant = plants.find(plant => 
            plant.name.toLowerCase() === row['PlantName'].toLowerCase());
          
          if (!matchingPlant) {
            console.warn(`Could not find matching plant for "${row['PlantName']}"`);
            continue;
          }
          
          // Parse year as integer
          let year;
          try {
            year = parseInt(row['Year']);
            if (isNaN(year)) {
              console.warn(`Invalid year value '${row['Year']}' for plant '${row['PlantName']}'`);
              continue;
            }
          } catch (e) {
            console.warn(`Invalid year value '${row['Year']}' for plant '${row['PlantName']}'`);
            continue;
          }
          
          // Build planting object
          const plantingData = {
            plant_id: matchingPlant.id,
            year: year,
            seedlings: row['Seedlings'] || null,
            planted: row['Planted'] || null,
            location: row['Location'] || null
          };
          
          plantings.push({
            plantName: row['PlantName'],
            matchedPlantId: matchingPlant.id,
            ...plantingData
          });
        }
        
        setParsedData(plantings);
        
      } catch (err) {
        console.error('Error parsing CSV', err);
        setError('Error parsing CSV file. Please make sure the file is in the correct format.');
        setParsedData(null);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading the file');
      setParsedData(null);
    };
    
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) {
      setError('No valid plantings found in the CSV file');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    const results = {
      total: parsedData.length,
      success: 0,
      duplicates: 0,
      errors: 0,
      details: []
    };
    
    try {
      for (const planting of parsedData) {
        try {
          // Extract just the API-required fields
          const plantingData = {
            plant_id: planting.plant_id,
            year: planting.year,
            seedlings: planting.seedlings,
            planted: planting.planted,
            location: planting.location
          };
          
          const response = await createPlantingAPI(plantingData);
          console.log('Planting import success:', planting.plantName, response);
          results.success++;
          results.details.push({
            name: planting.plantName,
            status: 'success',
            message: 'Successfully imported'
          });
        } catch (err) {
          console.error('Planting import error:', planting.plantName, err);
          console.log('Error response:', err.response?.status, err.response?.data);
          
          // Check for duplicate - either by 409 status code or by error message content
          if ((err.response && err.response.status === 409) || 
              (err.response?.data?.detail && err.response.data.detail.toLowerCase().includes('duplicate'))) {
            results.duplicates++;
            results.details.push({
              name: planting.plantName,
              status: 'duplicate',
              message: 'Duplicate planting'
            });
          } else {
            results.errors++;
            results.details.push({
              name: planting.plantName,
              status: 'error',
              message: err.response?.data?.detail || err.message || 'Unknown error'
            });
          }
        }
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setImportResults(results);
      
      // Notify parent that import is complete
      if (onImportComplete) {
        onImportComplete(results);
      }
    } catch (err) {
      setError('Error during import: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleCsv = () => {
    const element = document.createElement('a');
    const file = new Blob([sampleCsvContent], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = 'sample_plantings.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetForm = () => {
    setFile(null);
    setParsedData(null);
    setImportResults(null);
    setError(null);
  };

  return (
    <>
      <Box sx={{ mb: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="plantings-csv-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="plantings-csv-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadFileIcon />}
              color="success"
              sx={{ color: 'white' }}
              disabled={loading}
            >
              {loading ? 'Loading plants...' : 'Select CSV File'}
            </Button>
          </label>
          
          {file && (
            <Button
              variant="contained"
              color="success"
              onClick={handleImport}
              disabled={isUploading || !file || loading}
              sx={{ color: 'white' }}
              title="Click to import plantings from the selected CSV file"
            >
              {isUploading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Importing...
                </>
              ) : (
                'Import Plantings'
              )}
            </Button>
          )}
        </Box>
        
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
          </Typography>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {parsedData && parsedData.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success">
            Successfully parsed {parsedData.length} plantings from the CSV file
          </Alert>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">
              Ready to import {parsedData.length} plantings
            </Typography>
          </Box>
        </Box>
      )}
      
      {importResults && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" gutterBottom>
            Import Results
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3">{importResults.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total Plantings</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h3" color="success.main">{importResults.success}</Typography>
                <Typography variant="body2" color="text.secondary">Successfully Imported</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff8e1' }}>
                <Typography variant="h3" color="warning.main">{importResults.duplicates}</Typography>
                <Typography variant="body2" color="text.secondary">Duplicates Skipped</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                <Typography variant="h3" color="error.main">{importResults.errors}</Typography>
                <Typography variant="body2" color="text.secondary">Errors</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Details
          </Typography>
          
          <List>
            {importResults.details.map((detail, index) => (
              <ListItem
                key={index}
                divider={index < importResults.details.length - 1}
                sx={{
                  bgcolor: 
                    detail.status === 'success' ? '#f1f8e9' :
                    detail.status === 'duplicate' ? '#fffde7' : 
                    '#ffebee'
                }}
              >
                <ListItemText
                  primary={detail.name}
                  secondary={detail.message}
                />
                <Chip
                  icon={
                    detail.status === 'success' ? <CheckCircleIcon /> :
                    detail.status === 'duplicate' ? <WarningIcon /> :
                    <ErrorIcon />
                  }
                  label={
                    detail.status === 'success' ? 'Success' :
                    detail.status === 'duplicate' ? 'Duplicate' :
                    'Error'
                  }
                  color={
                    detail.status === 'success' ? 'success' :
                    detail.status === 'duplicate' ? 'warning' :
                    'error'
                  }
                  variant={detail.status === 'success' ? 'filled' : 'outlined'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="outlined"
              color="success"
              onClick={resetForm}
            >
              Import Another File
            </Button>
          </Box>
        </Box>
      )}
      
      <Card sx={{ mt: 4, mb: 3, bgcolor: '#f7f9fc' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HelpIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                CSV File Format
              </Typography>
            </Box>
            <IconButton
              onClick={() => setFormatExpanded(!formatExpanded)}
              aria-expanded={formatExpanded}
              aria-label="show more"
              title={formatExpanded ? "Hide format details" : "Show format details"}
            >
              {formatExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>
          
          <Button
            startIcon={<DownloadIcon />}
            onClick={downloadSampleCsv}
            variant="outlined"
            color="success"
            sx={{ mt: 1 }}
          >
            Download Sample CSV
          </Button>
          
          <Collapse in={formatExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" paragraph>
              Your CSV file should have the following columns:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="PlantName" 
                  secondary="Name of the plant (required, must match an existing plant name)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Year" 
                  secondary="Year for the planting (required, integer)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Seedlings" 
                  secondary="Date when seedlings were started (optional, YYYY-MM-DD format)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Planted" 
                  secondary="Date when plants were planted outdoors (optional, YYYY-MM-DD format)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Location" 
                  secondary="Where the plant was planted (optional)"
                />
              </ListItem>
            </List>
          </Collapse>
        </CardContent>
      </Card>
    </>
  );
};

export default ImportPlantings;