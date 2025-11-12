import { Router } from 'express';
import {
	listSessions,
	getSession,
	upsertSession,
	deleteSession,
	validateSession
} from '../controllers/session_controller.js';

const router = Router();

// List all sessions
router.get('/', listSessions);

// Get a session by ID
router.get('/:id', getSession);

// Create or update a session
router.post('/', upsertSession);

// Delete a session by ID
router.delete('/:id', deleteSession);

// Validate a session by ID
router.get('/:id/validate', validateSession);

export default router;
