const user = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  notificationPreferences: {},
};

const userWithPrefs = {
    ...user,
    notificationPreferences: {
        "new_feature": { "email": false, "inApp": true }
    }
}

const notification = {
  id: 1,
  userId: 1,
  message: "Test notification",
  isRead: false,
  createdAt: new Date(),
};

export { user, userWithPrefs, notification };
