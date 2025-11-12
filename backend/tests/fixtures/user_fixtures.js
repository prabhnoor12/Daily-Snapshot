// User fixtures for user controller tests

module.exports = {
  user1: {
    id: 1,
    email: 'user1@example.com',
    name: 'User One',
    role: 'user',
    deletedAt: null
  },
  user2: {
    id: 2,
    email: 'user2@example.com',
    name: 'User Two',
    role: 'admin',
    deletedAt: null
  },
  deletedUser: {
    id: 3,
    email: 'deleted@example.com',
    name: 'Deleted User',
    role: 'user',
    deletedAt: new Date()
  },
  newUserPayload: {
    email: 'newuser@example.com',
    name: 'New User',
    role: 'user'
  },
  updateUserPayload: {
    name: 'Updated Name',
    role: 'manager'
  },
  invalidUserPayload: {
    email: 'not-an-email',
    name: '',
    role: 'invalidrole'
  }
};
