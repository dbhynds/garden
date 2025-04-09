import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Plants from './pages/Plants';
import PlantDetails from './pages/PlantDetails';
import Plantings from './pages/Plantings';
import NotFound from './pages/NotFound';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Green
    },
    secondary: {
      main: '#ff9800', // Orange
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h1: {
      fontSize: '2.2rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/plants/:id" element={<PlantDetails />} />
          <Route path="/plantings" element={<Plantings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;