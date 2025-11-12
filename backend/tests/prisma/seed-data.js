// c:/my-saas-app/Daily-Snapshot/backend/prisma/seed-data.js

export const settingsToSeed = [
    // Settings for the application's visual appearance and localization
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
    // Settings for user notifications via different channels
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
    // Settings related to user profile visibility and social interactions
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
    // Settings for third-party service integrations
    {
        key: 'integrations',
        value: {
            slack: {
                enabled: false,
                webhookUrl: null,
            },
            googleAnalytics: {
                enabled: false,
                trackingId: null,
            },
        },
        type: 'json',
        category: 'Integrations',
        description: 'Manages connections to third-party services like Slack and Google Analytics.',
    },
];
