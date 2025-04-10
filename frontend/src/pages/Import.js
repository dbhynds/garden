import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import FenceIcon from '@mui/icons-material/Fence';

// Import components
import ImportPlants from '../components/ImportPlants';
import ImportPlantings from '../components/ImportPlantings';

const Import = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Check if location state contains activeTab
    if (location.state?.activeTab !== undefined) {
      setActiveTab(location.state.activeTab);
      // Clear the location state to prevent it from persisting on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h1" gutterBottom>
        Import Data
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="success"
          textColor="success"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .Mui-selected': {
              backgroundColor: '#e8f5e9', // Light green background for active tab
              fontWeight: 'bold',
              color: '#2e7d32', // Darker green text for active tab
            },
            '& .MuiTab-root': {
              padding: '12px 16px',
            }
          }}
        >
          <Tab 
            icon={<LocalFloristIcon />} 
            label="Import Plants" 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            icon={<FenceIcon />} 
            label="Import to Your Garden" 
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h2" gutterBottom>
              Import Plants
            </Typography>
            
            <Typography variant="body1" paragraph>
              Import multiple plants at once by uploading a CSV file with plant data.
            </Typography>
            
            <ImportPlants />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h2" gutterBottom>
              Import to Your Garden
            </Typography>
            
            <Typography variant="body1" paragraph>
              Import multiple plantings to your garden by uploading a CSV file with plant names, year, and dates.
            </Typography>
            
            <ImportPlantings />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

// TabPanel component to handle tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default Import;