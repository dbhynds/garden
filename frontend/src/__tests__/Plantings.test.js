import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Plantings from '../pages/Plantings';
import { getPlantingsAPI, getPlantsAPI } from '../services/api';

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

  test('displays plant names from the API response', async () => {
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
  });
});