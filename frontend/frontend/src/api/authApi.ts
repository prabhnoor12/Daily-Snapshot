// API client for authentication endpoints
import axios from 'axios';

const API_URL = '/api/auth';

export const login = (data: { email: string; password: string }) => axios.post(`${API_URL}/login`, data);
export const logout = () => axios.post(`${API_URL}/logout`);
export const getCurrentUser = () => axios.get(`${API_URL}/me`);
