

export const settingsToSeed = [
	{
		key: 'appearance',
		value: {
			theme: 'light',
			language: 'en',
			dateFormat: 'MM/DD/YYYY',
			timeZone: 'UTC',
		},
		type: 'json',
		category: 'Appearance',
		description: 'Controls the look and feel of the application, including theme and language.',
	},
	{
		key: 'notifications',
		value: {
			email: {
				newDeals: true,
				weeklySummary: false,
				securityAlerts: true,
			},
			push: {
				mentions: true,
				directMessages: true,
			},
		},
		type: 'json',
		category: 'Notifications',
		description: 'Manages user preferences for email and push notifications.',
	},
	{
		key: 'user-profile',
		value: {
			allowFriendRequests: true,
			showActivityStatus: true,
			profileVisibility: 'public',
		},
		type: 'json',
		category: 'Profile',
		description: 'Configures privacy and visibility settings for user profiles.',
	},
];
