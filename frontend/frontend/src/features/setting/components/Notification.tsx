import React, { useState, useEffect } from 'react';
import { getSettingByKey} from '../../../api/settingApi';
import {updateSetting} from "../../../api/settingApi";
import {deleteSetting} from "../../../api/settingApi";
import "./notification.css";
import "../../mobileResponsive.css";
interface NotificationSettings {
	email: {
		newDeals: boolean;
		weeklySummary: boolean;
		securityAlerts: boolean;
	};
	push: {
		mentions: boolean;
		directMessages: boolean;
	};
}

const defaultNotifications: NotificationSettings = {
	email: {
		newDeals: true,
		weeklySummary: false,
		securityAlerts: true,
	},
	push: {
		mentions: true,
		directMessages: true,
	},
};

const Notification: React.FC = () => {
	const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const res = await getSettingByKey('notifications');
						if (res.data && res.data.value) {
							let value = res.data.value;
							if (typeof value === 'string') {
								value = JSON.parse(value);
							}
																let parsedValue: NotificationSettings | null = null;
																if (typeof value === 'string') {
																	try {
																		parsedValue = JSON.parse(value) as NotificationSettings;
																	} catch {
																		parsedValue = null;
																	}
																}
																setNotifications({
																	email: {
																		...defaultNotifications.email,
																		...(parsedValue && typeof parsedValue === 'object' && parsedValue.email ? parsedValue.email : {}),
																	},
																	push: {
																		...defaultNotifications.push,
																		...(parsedValue && typeof parsedValue === 'object' && parsedValue.push ? parsedValue.push : {}),
																	},
																});
						}
			} catch {
				// Handle error (optional)
			} finally {
				setLoading(false);
			}
		};
		fetchNotifications();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		const [group, field] = name.split('.');
		setNotifications((prev) => ({
			...prev,
			[group]: {
				...prev[group as keyof NotificationSettings],
				[field]: checked,
			},
		}));
	};

	if (loading) return <div>Loading...</div>;

		const handleUpdate = async () => {
			await updateSetting('notifications', { value: JSON.stringify(notifications) });
			// Optionally show a success message
		};

		const handleDelete = async () => {
			await deleteSetting('notifications');
			setNotifications(defaultNotifications);
			// Optionally show a success message
		};

		return (
			<div className="notification-settings">
				<h2>Notification Settings</h2>
				<form>
					<fieldset>
						<legend>Email Notifications</legend>
						<label>
							<input
								type="checkbox"
								name="email.newDeals"
								checked={notifications.email.newDeals}
								onChange={handleChange}
							/>
							New Deals
						</label>
						<br />
						<label>
							<input
								type="checkbox"
								name="email.weeklySummary"
								checked={notifications.email.weeklySummary}
								onChange={handleChange}
							/>
							Weekly Summary
						</label>
						<br />
						<label>
							<input
								type="checkbox"
								name="email.securityAlerts"
								checked={notifications.email.securityAlerts}
								onChange={handleChange}
							/>
							Security Alerts
						</label>
					</fieldset>
					<br />
					<fieldset>
						<legend>Push Notifications</legend>
						<label>
							<input
								type="checkbox"
								name="push.mentions"
								checked={notifications.push.mentions}
								onChange={handleChange}
							/>
							Mentions
						</label>
						<br />
						<label>
							<input
								type="checkbox"
								name="push.directMessages"
								checked={notifications.push.directMessages}
								onChange={handleChange}
							/>
							Direct Messages
						</label>
					</fieldset>
					<br />
				<button type="button" onClick={handleUpdate}>Update</button>
				<button type="button" onClick={handleDelete} className="delete-btn">Delete</button>
				</form>
			</div>
		);
};

export default Notification;
