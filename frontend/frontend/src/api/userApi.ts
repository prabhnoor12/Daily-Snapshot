
import axios from 'axios';

const API_URL = '/api/user';

export interface User {
	id: string;
	name: string;
	email: string;
	// Add more fields as needed
}

export interface UserPayload {
	name: string;
	email: string;
	// Add more fields as needed
}

export const getUsers = () => axios.get<User[]>(`${API_URL}`);
export const getUserById = (id: string) => axios.get<User>(`${API_URL}/${id}`);
export const createUser = (data: UserPayload) => axios.post<User>(`${API_URL}`, data);
export const updateUser = (id: string, data: Partial<UserPayload>) => axios.put<User>(`${API_URL}/${id}`, data);
export const deleteUser = (id: string) => axios.delete(`${API_URL}/${id}`);
