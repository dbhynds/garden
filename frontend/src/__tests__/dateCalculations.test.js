import { calculatePlantingDates } from '../utils/dateCalculations';
import { format } from 'date-fns';

describe('Date Calculations', () => {
  const mockPlant = {
    id: 1,
    name: 'Test Plant',
    seedlings: -28, // 28 days before last frost
    transplant: 14, // 14 days after last frost
    harvest: 60 // 60 days after transplant
  };
  
  const year = 2025;
  const lastFrostDate = new Date(2025, 3, 18); // April 18th, 2025
  
  test('calculates seedlings date correctly', () => {
    const result = calculatePlantingDates(mockPlant, year);
    
    // Expected seedlings date: 28 days before April 18, 2025 = March 21, 2025
    const expectedDate = new Date(2025, 2, 21);
    
    expect(result.seedlingsDate).toEqual(expectedDate);
    expect(result.seedlingsFormatted).toEqual(format(expectedDate, 'MMM d, yyyy'));
  });
  
  test('calculates transplant date correctly', () => {
    const result = calculatePlantingDates(mockPlant, year);
    
    // Expected transplant date: 14 days after April 18, 2025 = May 2, 2025
    const expectedDate = new Date(2025, 4, 2);
    
    expect(result.transplantDate).toEqual(expectedDate);
    expect(result.transplantFormatted).toEqual(format(expectedDate, 'MMM d, yyyy'));
  });
  
  test('calculates harvest date correctly', () => {
    const result = calculatePlantingDates(mockPlant, year);
    
    // Expected transplant date: 14 days after April 18, 2025 = May 2, 2025
    // Expected harvest date: 60 days after May 2, 2025 = July 1, 2025
    const transplantDate = new Date(2025, 4, 2);
    const expectedHarvestDate = new Date(2025, 6, 1);
    
    expect(result.harvestDate).toEqual(expectedHarvestDate);
    expect(result.harvestFormatted).toEqual(format(expectedHarvestDate, 'MMM d, yyyy'));
  });
  
  test('handles null or undefined values gracefully', () => {
    const partialPlant = {
      id: 2,
      name: 'Partial Plant',
      // No seedlings value
      transplant: 21,
      // No harvest value
    };
    
    const result = calculatePlantingDates(partialPlant, year);
    
    expect(result.seedlingsDate).toBeNull();
    expect(result.seedlingsFormatted).toBeUndefined();
    
    // Expected transplant date: 21 days after April 18, 2025 = May 9, 2025
    const expectedDate = new Date(2025, 4, 9);
    expect(result.transplantDate).toEqual(expectedDate);
    
    expect(result.harvestDate).toBeNull();
    expect(result.harvestFormatted).toBeUndefined();
  });
});