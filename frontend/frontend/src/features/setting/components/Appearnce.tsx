import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(timezone);
import { getSettingByKey} from '../../../api/settingApi';
import {updateSetting} from "../../../api/settingApi";
import {deleteSetting} from "../../../api/settingApi";
	import "./apperance.css";
import "../../mobileResponsive.css";
interface AppearanceSettings {
	theme: 'light' | 'dark';
	language: string;
	dateFormat: string;
	timeZone: string;
}

const defaultAppearance: AppearanceSettings = {
	theme: 'light',
	language: 'en',
	dateFormat: 'MM/DD/YYYY',
	timeZone: 'UTC',
};

const dateFormats = [
	'MM/DD/YYYY',
	'DD/MM/YYYY',
	'YYYY-MM-DD',
	'MMM D, YYYY',
	'D MMM YYYY',
];

const timeZones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [
	'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'
];

const Appearnce: React.FC = () => {
	const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);
	const [loading, setLoading] = useState<boolean>(true);
	const [datePreview, setDatePreview] = useState('');
	const [timePreview, setTimePreview] = useState('');

	useEffect(() => {
		const fetchAppearance = async () => {
			try {
				const res = await getSettingByKey('appearance');
				if (res.data && res.data.value) {
					setAppearance({
						...defaultAppearance,
						...(typeof res.data.value === 'object' && res.data.value !== null ? res.data.value : {}),
					});
				}
			} catch {
				// Handle error (optional)
			} finally {
				setLoading(false);
			}
		};
		fetchAppearance();
		// Auto-detect timezone
		const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
		setAppearance(prev => ({ ...prev, timeZone: detected || prev.timeZone }));
	}, []);

	useEffect(() => {
		// Update date and time preview
		const now = dayjs().tz(appearance.timeZone);
		setDatePreview(now.format(appearance.dateFormat));
		setTimePreview(now.format('HH:mm:ss z')); // Show time and zone
	}, [appearance.dateFormat, appearance.timeZone]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setAppearance((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	if (loading) return <div>Loading...</div>;

		const handleUpdate = async () => {
			await updateSetting('appearance', { value: JSON.stringify(appearance) });
			// Optionally show a success message
		};

		const handleDelete = async () => {
			await deleteSetting('appearance');
			setAppearance(defaultAppearance);
			// Optionally show a success message
		};

		return (
			<div className="appearance-settings">
				<h2>Appearance Settings</h2>
				<form>
					<label>
						Theme:
						<select name="theme" value={appearance.theme} onChange={handleChange}>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
						</select>
					</label>
					<br />
					<label>
						Language:
						<input
							type="text"
							name="language"
							value={appearance.language}
							onChange={handleChange}
						/>
					</label>
					<br />
					<label>
						Date Format:
						<select name="dateFormat" value={appearance.dateFormat} onChange={handleChange}>
							{dateFormats.map(fmt => (
								<option key={fmt} value={fmt}>{fmt}</option>
							))}
						</select>
						<span className="preview">Preview: {datePreview}</span>
					</label>
					<br />
					<label>
						Time Zone:
						<select name="timeZone" value={appearance.timeZone} onChange={handleChange}>
							{timeZones.map(tz => (
								<option key={tz} value={tz}>{tz}</option>
							))}
						</select>
						<span className="preview">Current time: {timePreview}</span>
					</label>
					<br />
				<button type="button" onClick={handleUpdate}>Update</button>
				<button type="button" onClick={handleDelete} className="delete-btn">Delete</button>
				</form>
			</div>
		);
};

export default Appearnce;
