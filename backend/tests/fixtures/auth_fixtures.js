// Sample user and auth fixtures for testing

module.exports = {
  validUser: {
    id: 1,
    email: 'testuser@example.com',
    password: 'TestPassword123!', // Use plain for test, hash in real
    name: 'Test User',
    role: 'user',
    isActive: true
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  },
  signupPayload: {
    email: 'newuser@example.com',
    password: 'NewUserPass123!',
    name: 'New User'
  },
  loginPayload: {
    email: 'testuser@example.com',
    password: 'TestPassword123!'
  },
  invalidLoginPayload: {
    email: 'testuser@example.com',
    password: 'WrongPassword!'
  },
  token: 'sample.jwt.token', // Replace with actual token if needed
};
