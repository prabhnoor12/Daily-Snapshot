
import { Router } from 'express';
import {
	createUser,
	getUser,
	updateUser,
	deleteUser,
	listUsers
} from '../controllers/user_controller.js';

const router = Router();

// List all users
router.get('/', listUsers);

// Create a new user
router.post('/', createUser);

// Get a user by ID
router.get('/:id', getUser);

// Update a user by ID
router.put('/:id', updateUser);

// Delete a user by ID
router.delete('/:id', deleteUser);

export default router;
