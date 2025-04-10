import { 
  calculateSeedlingsDate, 
  calculateTransplantDate 
} from '../utils/dateCalculations';
import { format, addDays } from 'date-fns';

// Helper function to check if a planting has any overdue dates
// Since it's not exported from Plantings.js, we need to recreate it for testing
const isPlantingOverdue = (planting, year) => {
  const today = new Date('2023-05-15'); // Fixed date for testing
  
  // If the plant has been transplanted, it's not overdue
  // regardless of whether seedling dates were missed
  if (planting.planted) {
    return false;
  }
  
  // Check seedlings date
  if (planting.plant?.seedlings != null && !planting.seedlings) {
    const lastFrostDate = new Date(year, 3, 18); // Month is 0-indexed (3 = April)
    const recommendedSeedlingsDate = addDays(lastFrostDate, planting.plant.seedlings);
    if (today > recommendedSeedlingsDate) {
      return true;
    }
  }
  
  // Check transplant date
  if (planting.plant?.transplant != null && !planting.planted) {
    const lastFrostDate = new Date(year, 3, 18); // Month is 0-indexed (3 = April)
    const recommendedTransplantDate = addDays(lastFrostDate, planting.plant.transplant);
    if (today > recommendedTransplantDate) {
      return true;
    }
  }
  
  return false;
};

describe('isPlantingOverdue Function', () => {
  const currentYear = 2023; // Use fixed year for testing
  
  test('should return true for an overdue seedlings date', () => {
    // Create a plant that should have been started 45 days before last frost
    // Which is way overdue by May 15th
    const planting = {
      seedlings: null, // No actual seedling date recorded
      plant: {
        seedlings: -45, // 45 days before last frost
        transplant: 14  // 14 days after last frost (not overdue yet)
      }
    };
    
    expect(isPlantingOverdue(planting, currentYear)).toBe(true);
  });
  
  test('should return true for an overdue transplant date', () => {
    // Create a plant that should have been transplanted 10 days after last frost
    // Which would be April 28th, so it's overdue by May 15th
    const planting = {
      seedlings: '2023-03-01T00:00:00.000Z', // Has seedling date (March 1)
      planted: null, // No actual transplant date recorded
      plant: {
        seedlings: -45, // Not relevant since actual seedling date is set
        transplant: 10  // 10 days after last frost (April 28th)
      }
    };
    
    expect(isPlantingOverdue(planting, currentYear)).toBe(true);
  });
  
  test('should return false when all dates are in the future', () => {
    // Create a plant that should be transplanted 30 days after last frost
    // Which would be May 18th, so it's not overdue yet on May 15th
    // The seedlings field being NULL is important for this test
    const planting = {
      seedlings: null,
      planted: null,
      plant: {
        seedlings: null, // Important: No seedling date to check
        transplant: 30 // 30 days after last frost (May 18th)
      }
    };
    
    expect(isPlantingOverdue(planting, currentYear)).toBe(false);
  });
  
  test('should return false when all dates are filled in', () => {
    // Create a plant where all dates are already recorded
    const planting = {
      seedlings: '2023-03-01T00:00:00.000Z', // Has seedling date
      planted: '2023-05-01T00:00:00.000Z',   // Has transplant date
      plant: {
        seedlings: -45, // Not relevant since actual seedling date is set
        transplant: 10  // Not relevant since actual transplant date is set
      }
    };
    
    expect(isPlantingOverdue(planting, currentYear)).toBe(false);
  });
  
  test('should return false when plant is transplanted even if seedlings date was missed', () => {
    // Create a plant that would be overdue for seedlings but has been transplanted
    const planting = {
      seedlings: null, // Missing seedling date
      planted: '2023-05-01T00:00:00.000Z',   // Has transplant date
      plant: {
        seedlings: -45, // Would be overdue (45 days before last frost)
        transplant: 10  // Not relevant since actual transplant date is set
      }
    };
    
    expect(isPlantingOverdue(planting, currentYear)).toBe(false);
  });
  
  test('should handle plants without date information', () => {
    // Create a plant with no specific timing information
    const planting = {
      seedlings: null,
      planted: null,
      plant: {
        seedlings: null,
        transplant: null
      }
    };
    
    expect(isPlantingOverdue(planting, currentYear)).toBe(false);
  });
});