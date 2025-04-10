import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Import from '../pages/Import';
import { createPlantAPI, getPlantsAPI } from '../services/api';

// Mock the API calls
jest.mock('../services/api', () => ({
  createPlantAPI: jest.fn(),
  getPlantsAPI: jest.fn()
}));

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

function renderWithRouter(ui, locationState = null) {
  // Override the useLocation mock for this render
  if (locationState) {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      state: locationState
    });
  }
  
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
}

describe('Import component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the getPlantsAPI for ImportPlantings component
    getPlantsAPI.mockResolvedValue([
      { id: 1, name: 'Tomato', category: 'tomato' },
      { id: 2, name: 'Basil', category: 'herb' }
    ]);
  });

  test('renders Import page with tabs and default to Plants tab', () => {
    renderWithRouter(<Import />);

    // Check if the page title is displayed
    expect(screen.getByText('Import Data')).toBeInTheDocument();
    
    // Check if both tabs are displayed
    const plantsTab = screen.getByRole('tab', { name: /import plants/i });
    const plantingsTab = screen.getByRole('tab', { name: /import to your garden/i });
    expect(plantsTab).toBeInTheDocument();
    expect(plantingsTab).toBeInTheDocument();
    
    // Check that the Plants tab content is shown by default
    expect(screen.getByText('Import multiple plants at once by uploading a CSV file with plant data.')).toBeInTheDocument();
    
    // Check if CSV File Format section is present
    expect(screen.getByText('CSV File Format')).toBeInTheDocument();
    
    // Check if the download sample CSV button is displayed
    expect(screen.getByText('Download Sample CSV')).toBeInTheDocument();
  });
  
  test('can switch between tabs', async () => {
    renderWithRouter(<Import />);
    
    // First tab should be active by default
    expect(screen.getByText('Import multiple plants at once by uploading a CSV file with plant data.')).toBeInTheDocument();
    
    // Switch to the Plantings tab
    fireEvent.click(screen.getByRole('tab', { name: /import to your garden/i }));
    
    // Should now show Plantings content
    expect(screen.getByText('Import multiple plantings to your garden by uploading a CSV file with plant names, year, and dates.')).toBeInTheDocument();
  });

  test('opens Plantings tab directly when passed activeTab=1 in location state', async () => {
    // Render with location state that sets activeTab to 1 (Plantings)
    renderWithRouter(<Import />, { activeTab: 1 });
    
    // Should show Plantings content directly
    await waitFor(() => {
      expect(screen.getByText('Import multiple plantings to your garden by uploading a CSV file with plant names, year, and dates.')).toBeInTheDocument();
    });
  });
  
  test('can expand the CSV format section in Plants tab', async () => {
    renderWithRouter(<Import />);
    
    // Switch to Plants tab first to avoid test failure due to tab state
    fireEvent.click(screen.getByRole('tab', { name: /import plants/i }));
    
    // Find the show more button
    const expandButton = screen.getAllByLabelText('show more')[0];
    expect(expandButton).toBeInTheDocument();
    
    // Click the expand button
    fireEvent.click(expandButton);
    
    // Now the Format section should expand with details
    await waitFor(() => {
      expect(screen.getByText('Plant name (required)')).toBeInTheDocument();
    });
  });
  
  test('can expand the CSV format section in Plantings tab', async () => {
    renderWithRouter(<Import />);
    
    // Switch to the Plantings tab
    fireEvent.click(screen.getByRole('tab', { name: /import to your garden/i }));
    
    // Wait for the Plantings tab to load
    await waitFor(() => {
      expect(screen.getByText('Import multiple plantings to your garden by uploading a CSV file with plant names, year, and dates.')).toBeInTheDocument();
    });
    
    // Find the show more button in the Plantings tab
    const expandButtons = screen.getAllByLabelText('show more');
    expect(expandButtons.length).toBeGreaterThan(0);
    
    // Click the expand button
    fireEvent.click(expandButtons[0]);
    
    // Now the details should be visible
    expect(screen.getByText('PlantName')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Seedlings')).toBeInTheDocument();
    expect(screen.getByText('Planted')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });
});