import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Plantings from '../pages/Plantings';
import { getPlantingsAPI, getPlantsAPI } from '../services/api';
import { format, addDays } from 'date-fns';

// Mock the API calls
jest.mock('../services/api', () => ({
  getPlantingsAPI: jest.fn(),
  getPlantsAPI: jest.fn(),
  createPlantingAPI: jest.fn(),
  updatePlantingAPI: jest.fn(),
  deletePlantingAPI: jest.fn(),
}));

// Mock the RouterLink component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn().mockImplementation(({ to, children, ...props }) => (
    <a href={to} {...props}>{children}</a>
  )),
  useLocation: () => ({
    state: null
  }),
}));

describe('Plantings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays plant names and categories from the API response', async () => {
    // Mock API responses
    const mockPlantings = [
      {
        id: 1,
        year: 2025,
        plant_id: 1,
        seedlings: null,
        planted: null,
        location: 'Garden Bed 1',
        plant: {
          id: 1,
          name: 'Tomato',
          category: 'tomato',
          type: 'Cherry'
        }
      }
    ];
    
    const mockPlants = [
      {
        id: 1,
        name: 'Tomato',
        category: 'tomato',
        type: 'Cherry'
      }
    ];

    getPlantingsAPI.mockResolvedValue(mockPlantings);
    getPlantsAPI.mockResolvedValue(mockPlants);

    render(
      <BrowserRouter>
        <Plantings />
      </BrowserRouter>
    );

    // Wait for API calls to complete and component to update
    await waitFor(() => {
      expect(getPlantingsAPI).toHaveBeenCalled();
      expect(getPlantsAPI).toHaveBeenCalled();
    });

    // Check if the plant name is displayed
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Check if the location is displayed
    await waitFor(() => {
      expect(screen.getByText('Garden Bed 1')).toBeInTheDocument();
    });
    
    // Check if the category chip is displayed with correct letter
    await waitFor(() => {
      const categoryChip = screen.getByText('T');
      expect(categoryChip).toBeInTheDocument();
    });
  });
  
  test('displays date chips for plantings with date info', async () => {
    // Set up current date for past/future date comparisons
    const thisYear = new Date().getFullYear();
    const lastFrostDate = new Date(thisYear, 3, 18); // April 18th
    
    // Mock API responses with dates
    const mockPlantings = [
      {
        id: 1,
        year: thisYear,
        plant_id: 1,
        seedlings: new Date(thisYear, 2, 15).toISOString(), // Actual seedling date - March 15
        planted: null, // No actual transplant date
        location: 'Garden Bed 1',
        plant: {
          id: 1,
          name: 'Tomato',
          category: 'tomato',
          seedlings: -30, // 30 days before last frost
          transplant: 14, // 14 days after last frost
          harvest: 60 // 60 days to harvest after transplant
        }
      }
    ];
    
    const mockPlants = [
      {
        id: 1,
        name: 'Tomato',
        category: 'tomato',
        seedlings: -30,
        transplant: 14,
        harvest: 60
      }
    ];

    getPlantingsAPI.mockResolvedValue(mockPlantings);
    getPlantsAPI.mockResolvedValue(mockPlants);

    render(
      <BrowserRouter>
        <Plantings />
      </BrowserRouter>
    );

    // Wait for API calls to complete and component to update
    await waitFor(() => {
      expect(getPlantingsAPI).toHaveBeenCalled();
      expect(getPlantsAPI).toHaveBeenCalled();
    });

    // Check for actual seedlings date (should be March 15)
    await waitFor(() => {
      expect(screen.getByText('Mar 15, ' + thisYear)).toBeInTheDocument();
    });
    
    // Check for recommended transplant date (should be May 2)
    const recommendedTransplantDate = format(addDays(lastFrostDate, 14), 'MMM d, yyyy');
    await waitFor(() => {
      expect(screen.getByText(recommendedTransplantDate)).toBeInTheDocument();
    });
    
    // Check for estimated harvest date
    // This should be 60 days after recommended transplant date
    const transplantDate = addDays(lastFrostDate, 14);
    const estimatedHarvestDate = format(addDays(transplantDate, 60), 'MMM d, yyyy');
    await waitFor(() => {
      expect(screen.getByText(estimatedHarvestDate)).toBeInTheDocument();
    });
  });
});