// Import jest-dom utilities
import '@testing-library/jest-dom';

// Add TextEncoder/TextDecoder polyfills for jsdom
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock axios for all tests
jest.mock('axios', () => ({
  create: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({}),
  post: jest.fn().mockResolvedValue({}),
  put: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}));