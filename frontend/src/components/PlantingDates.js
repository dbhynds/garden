import React from 'react';
import { 
  Typography, 
  Box, 
  Tooltip, 
  Chip,
  Paper
} from '@mui/material';
import FenceIcon from '@mui/icons-material/Fence';
import SeedlingIcon from '@mui/icons-material/Spa';
import TransplantIcon from '@mui/icons-material/Grass';
import HarvestIcon from '@mui/icons-material/Agriculture';
import { calculatePlantingDates } from '../utils/dateCalculations';

/**
 * Component to display calculated planting dates based on plant info
 */
const PlantingDates = ({ plant, year }) => {
  // If plant doesn't have the necessary data, don't render anything
  if (!plant || !year) {
    return null;
  }
  
  const dates = calculatePlantingDates(plant, year);
  
  if (!dates.seedlingsDate && !dates.transplantDate && !dates.harvestDate) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 2, bgcolor: '#f8f9fa' }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
        <FenceIcon fontSize="small" sx={{ mr: 1 }} />
        Recommended Planting Dates for {year}
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {dates.seedlingsDate && (
          <Tooltip title={`${dates.seedlingsDays} days ${dates.seedlingsDays < 0 ? 'before' : 'after'} last frost (Apr 18)`}>
            <Chip 
              icon={<SeedlingIcon />} 
              label={dates.seedlingsFormatted}
              color="success"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
          </Tooltip>
        )}
        
        {dates.transplantDate && (
          <Tooltip title={`${dates.transplantDays} days ${dates.transplantDays < 0 ? 'before' : 'after'} last frost (Apr 18)`}>
            <Chip 
              icon={<TransplantIcon />} 
              label={dates.transplantFormatted}
              color="success"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
          </Tooltip>
        )}
        
        {dates.harvestDate && (
          <Tooltip title={`${dates.harvestDays} days after transplanting`}>
            <Chip 
              icon={<HarvestIcon />} 
              label={dates.harvestFormatted}
              color="success"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
          </Tooltip>
        )}
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        <strong>Recommendations:</strong> Start seedlings {dates.seedlingsDays ? 
          <span>{Math.abs(dates.seedlingsDays)} days {dates.seedlingsDays < 0 ? 'before' : 'after'} last frost</span> : 'N/A'}, 
        plant outdoors {dates.transplantDays ? 
          <span>{Math.abs(dates.transplantDays)} days {dates.transplantDays < 0 ? 'before' : 'after'} last frost</span> : 'N/A'}
      </Typography>
    </Paper>
  );
};

export default PlantingDates;