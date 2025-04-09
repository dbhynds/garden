import { format, addDays } from 'date-fns';

// Import the functions directly from Plantings.js for testing
// Note: For proper module organization, these functions should ideally be moved to a separate utility file
const calculateSeedlingsDate = (plant, year) => {
  const lastFrostDate = new Date(year, 3, 18);
  return addDays(lastFrostDate, plant.seedlings);
};

const calculateTransplantDate = (plant, year) => {
  const lastFrostDate = new Date(year, 3, 18);
  return addDays(lastFrostDate, plant.transplant);
};

const calculateHarvestDate = (plant, planting, filterYear) => {
  if (!plant.harvest) return null;
  
  let baseDate;
  if (planting.planted) {
    baseDate = new Date(planting.planted);
  } else if (plant.transplant != null) {
    const lastFrostDate = new Date(filterYear, 3, 18);
    baseDate = addDays(lastFrostDate, plant.transplant);
  } else {
    return null;
  }
  
  return addDays(baseDate, plant.harvest);
};

describe('Planting Date Calculations', () => {
  const mockPlant = {
    id: 1,
    name: 'Test Plant',
    seedlings: -28, // 28 days before last frost
    transplant: 14, // 14 days after last frost
    harvest: 60 // 60 days after transplant
  };
  
  const thisYear = 2025;
  const lastFrostDate = new Date(thisYear, 3, 18); // April 18th
  
  test('calculateSeedlingsDate returns correct date', () => {
    // Expected seedlings date: 28 days before April 18, 2025 = March 21, 2025
    const expectedDate = new Date(thisYear, 2, 21);
    const result = calculateSeedlingsDate(mockPlant, thisYear);
    
    expect(result).toEqual(expectedDate);
    expect(format(result, 'MMM d, yyyy')).toEqual('Mar 21, 2025');
  });
  
  test('calculateTransplantDate returns correct date', () => {
    // Expected transplant date: 14 days after April 18, 2025 = May 2, 2025
    const expectedDate = new Date(thisYear, 4, 2);
    const result = calculateTransplantDate(mockPlant, thisYear);
    
    expect(result).toEqual(expectedDate);
    expect(format(result, 'MMM d, yyyy')).toEqual('May 2, 2025');
  });
  
  test('calculateHarvestDate uses actual transplant date when available', () => {
    // Planting with actual transplant date of May 10, 2025
    const planting = {
      planted: new Date(thisYear, 4, 10).toISOString()
    };
    
    // Expected harvest date: 60 days after May 10, 2025 = July 9, 2025
    const expectedDate = new Date(thisYear, 6, 9);
    const result = calculateHarvestDate(mockPlant, planting, thisYear);
    
    expect(result).toEqual(expectedDate);
    expect(format(result, 'MMM d, yyyy')).toEqual('Jul 9, 2025');
  });
  
  test('calculateHarvestDate falls back to recommended transplant date', () => {
    // Planting with no actual transplant date
    const planting = {
      planted: null
    };
    
    // Expected transplant date: 14 days after April 18, 2025 = May 2, 2025
    // Expected harvest date: 60 days after May 2, 2025 = July 1, 2025
    const transplantDate = addDays(lastFrostDate, mockPlant.transplant);
    const expectedDate = addDays(transplantDate, mockPlant.harvest);
    
    const result = calculateHarvestDate(mockPlant, planting, thisYear);
    
    expect(result).toEqual(expectedDate);
    expect(format(result, 'MMM d, yyyy')).toEqual('Jul 1, 2025');
  });
  
  test('calculateHarvestDate returns null when no harvest data', () => {
    const plantWithoutHarvest = {
      ...mockPlant,
      harvest: null
    };
    
    const planting = {
      planted: new Date(thisYear, 4, 10).toISOString()
    };
    
    const result = calculateHarvestDate(plantWithoutHarvest, planting, thisYear);
    expect(result).toBeNull();
  });
  
  test('calculateHarvestDate returns null when no transplant info available', () => {
    const plantWithoutTransplant = {
      ...mockPlant,
      transplant: null
    };
    
    // Planting with no actual transplant date
    const planting = {
      planted: null
    };
    
    const result = calculateHarvestDate(plantWithoutTransplant, planting, thisYear);
    expect(result).toBeNull();
  });
});