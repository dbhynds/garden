import { format, addDays } from 'date-fns';

/**
 * Calculate dates for seedlings and transplanting based on the plant's 
 * days relative to last frost date
 * 
 * @param {Object} plant - The plant object with seedlings and transplant properties
 * @param {number} year - The year to calculate dates for
 * @returns {Object} Object containing calculated dates
 */
export const calculatePlantingDates = (plant, year) => {
  // April 18 is the last frost date
  const lastFrostDate = new Date(year, 3, 18); // Month is 0-indexed (3 = April)
  
  let result = {
    seedlingsDate: null,
    transplantDate: null,
    harvestDate: null,
    // Add the original values for reference
    seedlingsDays: plant.seedlings,
    transplantDays: plant.transplant,
    harvestDays: plant.harvest
  };
  
  // Calculate seedlings date if available
  if (plant.seedlings !== null && plant.seedlings !== undefined) {
    const seedlingsDate = addDays(lastFrostDate, plant.seedlings);
    result.seedlingsDate = seedlingsDate;
    result.seedlingsFormatted = format(seedlingsDate, 'MMM d, yyyy');
  }
  
  // Calculate transplant date if available
  if (plant.transplant !== null && plant.transplant !== undefined) {
    const transplantDate = addDays(lastFrostDate, plant.transplant);
    result.transplantDate = transplantDate;
    result.transplantFormatted = format(transplantDate, 'MMM d, yyyy');
  }
  
  // Calculate harvest date if available and a transplant date is specified
  if (plant.harvest !== null && plant.harvest !== undefined && plant.transplant !== null && plant.transplant !== undefined) {
    const transplantDate = addDays(lastFrostDate, plant.transplant);
    const harvestDate = addDays(transplantDate, plant.harvest);
    result.harvestDate = harvestDate;
    result.harvestFormatted = format(harvestDate, 'MMM d, yyyy');
  }

  return result;
};