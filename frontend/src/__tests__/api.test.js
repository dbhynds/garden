import axios from 'axios';
import { 
  getPlantsAPI, 
  getPlantAPI, 
  createPlantAPI, 
  updatePlantAPI, 
  deletePlantAPI,
  getPlantingsAPI,
  getPlantingAPI,
  createPlantingAPI,
  updatePlantingAPI,
  deletePlantingAPI
} from '../services/api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnThis(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Plants API tests
  describe('Plants API', () => {
    test('getPlantsAPI should fetch all plants', async () => {
      const mockPlants = [{ id: 1, name: 'Tomato' }];
      axios.get.mockResolvedValueOnce({ data: mockPlants });

      const result = await getPlantsAPI();
      
      expect(axios.get).toHaveBeenCalledWith('/plants/');
      expect(result).toEqual(mockPlants);
    });

    test('getPlantAPI should fetch a single plant', async () => {
      const mockPlant = { id: 1, name: 'Tomato' };
      axios.get.mockResolvedValueOnce({ data: mockPlant });

      const result = await getPlantAPI(1);
      
      expect(axios.get).toHaveBeenCalledWith('/plants/1');
      expect(result).toEqual(mockPlant);
    });

    test('createPlantAPI should create a new plant', async () => {
      const mockPlant = { name: 'Tomato', category: 'tomato' };
      const mockResponse = { ...mockPlant, id: 1 };
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await createPlantAPI(mockPlant);
      
      expect(axios.post).toHaveBeenCalledWith('/plants/', mockPlant);
      expect(result).toEqual(mockResponse);
    });

    test('updatePlantAPI should update an existing plant', async () => {
      const mockPlant = { name: 'Updated Tomato' };
      const mockResponse = { id: 1, name: 'Updated Tomato', category: 'tomato' };
      axios.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await updatePlantAPI(1, mockPlant);
      
      expect(axios.put).toHaveBeenCalledWith('/plants/1', mockPlant);
      expect(result).toEqual(mockResponse);
    });

    test('deletePlantAPI should delete a plant', async () => {
      axios.delete.mockResolvedValueOnce({});

      const result = await deletePlantAPI(1);
      
      expect(axios.delete).toHaveBeenCalledWith('/plants/1');
      expect(result).toBe(true);
    });
  });

  // Plantings API tests
  describe('Plantings API', () => {
    test('getPlantingsAPI should fetch all plantings with no filters', async () => {
      const mockPlantings = [{ id: 1, year: 2025, plant_id: 1 }];
      axios.get.mockResolvedValueOnce({ data: mockPlantings });

      const result = await getPlantingsAPI();
      
      expect(axios.get).toHaveBeenCalledWith('/plantings/?');
      expect(result).toEqual(mockPlantings);
    });

    test('getPlantingsAPI should fetch plantings with filters', async () => {
      const mockPlantings = [{ id: 1, year: 2025, plant_id: 1 }];
      axios.get.mockResolvedValueOnce({ data: mockPlantings });

      const result = await getPlantingsAPI({ year: 2025 });
      
      expect(axios.get).toHaveBeenCalledWith('/plantings/?year=2025');
      expect(result).toEqual(mockPlantings);
    });

    test('getPlantingAPI should fetch a single planting', async () => {
      const mockPlanting = { id: 1, year: 2025, plant_id: 1 };
      axios.get.mockResolvedValueOnce({ data: mockPlanting });

      const result = await getPlantingAPI(1);
      
      expect(axios.get).toHaveBeenCalledWith('/plantings/1');
      expect(result).toEqual(mockPlanting);
    });
  });
});