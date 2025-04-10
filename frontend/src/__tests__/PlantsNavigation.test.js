import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Plants from '../pages/Plants';
import { getPlantsAPI } from '../services/api';

// Mock the API calls
jest.mock('../services/api', () => ({
  getPlantsAPI: jest.fn(),
  createPlantAPI: jest.fn(),
  updatePlantAPI: jest.fn(),
  deletePlantAPI: jest.fn(),
  createPlantingAPI: jest.fn(),
}));

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Plants page navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API responses
    getPlantsAPI.mockResolvedValue([]);
  });

  test('navigates to Import page when Import Plants button is clicked', async () => {
    render(
      <BrowserRouter>
        <Plants />
      </BrowserRouter>
    );
    
    // Wait for the component to load and API call to complete
    await screen.findByText('Plants');
    
    // Find the Import button
    const importButton = screen.getByText('Import');
    expect(importButton).toBeInTheDocument();
    
    // Click the Import button
    fireEvent.click(importButton);
    
    // Verify navigation to the Import page
    expect(mockNavigate).toHaveBeenCalledWith('/import');
  });
});