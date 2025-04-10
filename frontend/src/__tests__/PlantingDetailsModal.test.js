import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Plants from '../pages/Plants';
import { 
  getPlantsAPI, 
  createPlantingAPI 
} from '../services/api';

// Mock the API calls
jest.mock('../services/api', () => ({
  getPlantsAPI: jest.fn(),
  createPlantAPI: jest.fn(),
  updatePlantAPI: jest.fn(),
  deletePlantAPI: jest.fn(),
  createPlantingAPI: jest.fn(),
}));

// Mock the router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Planting Details Modal', () => {
  const currentYear = new Date().getFullYear();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    getPlantsAPI.mockResolvedValue([
      { id: 1, name: 'Tomato', category: 'tomato' },
      { id: 2, name: 'Lettuce', category: 'green' },
    ]);
    
    createPlantingAPI.mockResolvedValue({ id: 1, year: currentYear });
  });

  test('modal appears when "Add plants to garden" button is clicked', async () => {
    render(
      <BrowserRouter>
        <Plants />
      </BrowserRouter>
    );

    // Wait for plant data to load and loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Now that data is loaded, we should see a table with plants
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Select a plant by clicking its checkbox (now the DOM should be ready)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(1); // Make sure checkboxes are loaded
    fireEvent.click(checkboxes[1]); // First plant checkbox (not the select all)

    // Find and click the "Add plants to garden" button
    const addButton = await screen.findByText(/Add 1 plants? to your garden/i);
    fireEvent.click(addButton);

    // Verify that the modal appears
    await waitFor(() => {
      expect(screen.getByText('Add Planting Details (Optional)')).toBeInTheDocument();
    });

    // Verify that both date fields are in the modal
    expect(screen.getByLabelText('Start Seedlings Date (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Plant Outdoors Date (optional)')).toBeInTheDocument();
    
    // Verify that the location field is NOT in the modal
    expect(screen.queryByLabelText('Location (optional)')).not.toBeInTheDocument();
  });

  test('createPlantingAPI is called with correct data when form is submitted', async () => {
    render(
      <BrowserRouter>
        <Plants />
      </BrowserRouter>
    );

    // Wait for plant data to load and loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Now that data is loaded, we should see a table with plants
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Select a plant
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(1);
    fireEvent.click(checkboxes[1]);

    // Open the modal
    const addButton = screen.getByText(/Add 1 plants? to your garden/i);
    fireEvent.click(addButton);

    // Fill out the date fields
    const seedlingsInput = screen.getByLabelText('Start Seedlings Date (optional)');
    const plantedInput = screen.getByLabelText('Plant Outdoors Date (optional)');
    
    // Set seedlings date to April 1
    fireEvent.change(seedlingsInput, { target: { value: `${currentYear}-04-01` } });
    
    // Set transplant date to May 1
    fireEvent.change(plantedInput, { target: { value: `${currentYear}-05-01` } });

    // Submit the form
    const submitButton = screen.getByText('Add to Garden');
    fireEvent.click(submitButton);

    // Verify API was called with the correct data
    await waitFor(() => {
      expect(createPlantingAPI).toHaveBeenCalledWith({
        year: currentYear,
        plant_id: expect.any(Number),
        planted: `${currentYear}-05-01`,
        seedlings: `${currentYear}-04-01`
      });
    });
  });
  
  test('plantings API is called with only provided fields', async () => {
    render(
      <BrowserRouter>
        <Plants />
      </BrowserRouter>
    );

    // Wait for plant data to load and loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Now that data is loaded, we should see a table with plants
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Select a plant
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(1);
    fireEvent.click(checkboxes[1]);

    // Open the modal
    const addButton = screen.getByText(/Add 1 plants? to your garden/i);
    fireEvent.click(addButton);

    // Only fill out the plant outdoors date - leave seedlings empty
    const plantedInput = screen.getByLabelText('Plant Outdoors Date (optional)');
    fireEvent.change(plantedInput, { target: { value: `${currentYear}-05-01` } });

    // Submit the form
    const submitButton = screen.getByText('Add to Garden');
    fireEvent.click(submitButton);

    // Verify API was called with the planted date but no seedlings field
    await waitFor(() => {
      expect(createPlantingAPI).toHaveBeenCalledWith({
        year: currentYear,
        plant_id: expect.any(Number),
        planted: `${currentYear}-05-01`
      });
      
      // Verify that the API call does NOT include a seedlings field
      const apiCall = createPlantingAPI.mock.calls[0][0];
      expect(apiCall).not.toHaveProperty('seedlings');
    });
  });
});