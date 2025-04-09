import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Plant API calls
export const getPlantsAPI = async () => {
  const response = await api.get('/plants/');
  return response.data;
};

export const getPlantAPI = async (id) => {
  const response = await api.get(`/plants/${id}`);
  return response.data;
};

export const createPlantAPI = async (plantData) => {
  const response = await api.post('/plants/', plantData);
  return response.data;
};

export const updatePlantAPI = async (id, plantData) => {
  const response = await api.put(`/plants/${id}`, plantData);
  return response.data;
};

export const deletePlantAPI = async (id) => {
  await api.delete(`/plants/${id}`);
  return true;
};

// Planting API calls
export const getPlantingsAPI = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.year) params.append('year', filters.year);
  if (filters.plant_id) params.append('plant_id', filters.plant_id);
  
  const response = await api.get(`/plantings/?${params.toString()}`);
  return response.data;
};

export const getPlantingAPI = async (id) => {
  const response = await api.get(`/plantings/${id}`);
  return response.data;
};

export const createPlantingAPI = async (plantingData) => {
  const response = await api.post('/plantings/', plantingData);
  return response.data;
};

export const updatePlantingAPI = async (id, plantingData) => {
  const response = await api.put(`/plantings/${id}`, plantingData);
  return response.data;
};

export const deletePlantingAPI = async (id) => {
  await api.delete(`/plantings/${id}`);
  return true;
};