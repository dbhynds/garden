import React, { useState } from 'react';
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
import { createPlantAPI } from '../services/api';

// Category mapping from one-letter codes to full category names
const CATEGORY_MAP = {
  "T": "tomato",
  "P": "pepper",
  "V": "vegetable",
  "G": "green",
  "H": "herb",
  "F": "flower"
};

const ImportPlants = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [formatExpanded, setFormatExpanded] = useState(false);

  // Sample CSV content for the user to download
  const sampleCsvContent = `Plant,Type,Seedlings,Transplant,Harvest
Broccoli,V,-42,-14,75
Shishito,P,-42,28,90
Pink radicchio,G,-28,0,55
Basil,H,,28,
Beets,V,,14,55`;

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
        
        if (!headers.includes('Plant') || !headers.includes('Type')) {
          setError('CSV file must contain "Plant" and "Type" columns');
          setParsedData(null);
          return;
        }
        
        const plants = [];
        
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
          
          // Convert type letter code to full category name
          const categoryCode = row['Type'];
          const category = CATEGORY_MAP[categoryCode];
          if (!category) {
            console.warn(`Unknown category code '${categoryCode}' for plant '${row['Plant']}', skipping`);
            continue;
          }
          
          // Clean and convert numeric fields
          let seedlings = row['Seedlings'] ? row['Seedlings'] : null;
          let transplant = row['Transplant'] ? row['Transplant'] : null;
          let harvest = row['Harvest'] ? row['Harvest'] : null;
          
          if (seedlings !== null) {
            try {
              seedlings = parseInt(seedlings);
              if (isNaN(seedlings)) seedlings = null;
            } catch (e) {
              console.warn(`Invalid seedlings value '${seedlings}' for plant '${row['Plant']}', setting to null`);
              seedlings = null;
            }
          }
          
          if (transplant !== null) {
            try {
              transplant = parseInt(transplant);
              if (isNaN(transplant)) transplant = null;
            } catch (e) {
              console.warn(`Invalid transplant value '${transplant}' for plant '${row['Plant']}', setting to null`);
              transplant = null;
            }
          }
          
          if (harvest !== null) {
            try {
              harvest = parseInt(harvest);
              if (isNaN(harvest)) harvest = null;
            } catch (e) {
              console.warn(`Invalid harvest value '${harvest}' for plant '${row['Plant']}', setting to null`);
              harvest = null;
            }
          }
          
          const plant = {
            name: row['Plant'],
            category: category,
            seedlings: seedlings,
            transplant: transplant,
            harvest: harvest
          };
          plants.push(plant);
        }
        
        setParsedData(plants);
        
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
      setError('No valid plants found in the CSV file');
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
      for (const plant of parsedData) {
        try {
          const response = await createPlantAPI(plant);
          console.log('Plant import success:', plant.name, response);
          results.success++;
          results.details.push({
            name: plant.name,
            status: 'success',
            message: 'Successfully imported'
          });
        } catch (err) {
          // Check if it's a duplicate (409 Conflict status)
          console.error('Plant import error:', plant.name, err);
          console.log('Error response:', err.response?.status, err.response?.data);
          
          // Check for duplicate - either by 409 status code or by error message content
          if ((err.response && err.response.status === 409) || 
              (err.response?.data?.detail && err.response.data.detail.toLowerCase().includes('duplicate'))) {
            results.duplicates++;
            results.details.push({
              name: plant.name,
              status: 'duplicate',
              message: 'Duplicate plant'
            });
          } else {
            results.errors++;
            results.details.push({
              name: plant.name,
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
    element.download = 'sample_plants.csv';
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
            id="plants-csv-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="plants-csv-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadFileIcon />}
              color="success"
              sx={{ color: 'white' }}
            >
              Select CSV File
            </Button>
          </label>
          
          {file && (
            <Button
              variant="contained"
              color="success"
              onClick={handleImport}
              disabled={isUploading || !file}
              sx={{ color: 'white' }}
              title="Click to import plants from the selected CSV file"
            >
              {isUploading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Importing...
                </>
              ) : (
                'Import Plants'
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
            Successfully parsed {parsedData.length} plants from the CSV file
          </Alert>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">
              Ready to import {parsedData.length} plants
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
                <Typography variant="body2" color="text.secondary">Total Plants</Typography>
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
                  primary="Plant" 
                  secondary="Plant name (required)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Type" 
                  secondary="One-letter code for category (required): T=tomato, P=pepper, V=vegetable, G=green, H=herb, F=flower"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Seedlings" 
                  secondary="Days before/after last frost to start seedlings (optional, integer)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Transplant" 
                  secondary="Days before/after last frost to plant outdoors (optional, integer)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Harvest" 
                  secondary="Days to maturity (optional, integer)"
                />
              </ListItem>
            </List>
          </Collapse>
        </CardContent>
      </Card>
    </>
  );
};

export default ImportPlants;