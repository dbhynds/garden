import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Mock the RouterLink component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn().mockImplementation(({ to, children, ...props }) => (
    <a href={to} {...props}>{children}</a>
  )),
}));

describe('Home Component', () => {
  test('renders welcome message', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check if the welcome message is in the document
    expect(screen.getByText(/Welcome to Garden Planner/i)).toBeInTheDocument();
  });

  test('renders Plants and Plantings sections', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check if Plants and Your Garden sections are in the document using more specific queries
    expect(screen.getByRole('heading', { name: /Plants/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your Garden/i })).toBeInTheDocument();
    
    // Check if the navigation buttons are in the document
    expect(screen.getByText('View Plants')).toBeInTheDocument();
    expect(screen.getByText('View Your Garden')).toBeInTheDocument();
  });
});