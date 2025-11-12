
import axios from 'axios';

const API_URL = '/api/session';

export interface Session {
	id: string;
	userId: string;
	expiresAt: string;
	// Add more fields as needed
}

export interface UpsertSessionPayload {
	userId: string;
	expiresAt: string;
	// Add more fields as needed
}

export const listSessions = () => axios.get<Session[]>(`${API_URL}`);
export const getSessionById = (id: string) => axios.get<Session>(`${API_URL}/${id}`);
export const upsertSession = (data: UpsertSessionPayload) => axios.post<Session>(`${API_URL}`, data);
export const deleteSession = (id: string) => axios.delete(`${API_URL}/${id}`);
export const validateSession = (id: string) => axios.get<{ valid: boolean }>(`${API_URL}/${id}/validate`);
