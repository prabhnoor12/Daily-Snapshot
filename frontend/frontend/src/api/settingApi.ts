
import axios from 'axios';

const API_URL = '/api/setting';

export interface Setting {
	key: string;
	value: string;
	// Add more fields as needed
}

export interface BulkUpdatePayload {
	settings: Setting[];
}

export const getSettings = () => axios.get<Setting[]>(`${API_URL}`);
export const getSettingByKey = (key: string) => axios.get<Setting>(`${API_URL}/${key}`);
export const updateSetting = (key: string, data: Partial<Setting>) => axios.put<Setting>(`${API_URL}/${key}`, data);
export const bulkUpdateSettings = (data: BulkUpdatePayload) => axios.put<Setting[]>(`${API_URL}/bulk`, data);
export const deleteSetting = (key: string) => axios.delete(`${API_URL}/${key}`);
