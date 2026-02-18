import express from 'express';
import TeamController from '../controllers/team.controller.js';
import TeamValidator from '../validators/team.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateUUID } from '../middlewares/paramValidator.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = express.Router();

// All team routes are protected
router.use(protect);

router.get('/', TeamController.getAll);
router.get('/:id', validateUUID('id'), TeamController.getById);

// Admin/PM only team creation (per spec: Admin creates teams; PM allowed here for flexibility)
router.post('/', restrictTo(ROLES.ADMIN), validate(TeamValidator.create), TeamController.create);
router.patch('/:id', validateUUID('id'), restrictTo(ROLES.PROJECT_MANAGER, ROLES.ADMIN), TeamController.update);
router.delete('/:id', validateUUID('id'), restrictTo(ROLES.ADMIN), TeamController.delete);

// Membership management
router.get('/:id/members', validateUUID('id'), TeamController.getMembers);
router.post('/:id/members', validateUUID('id'), restrictTo(ROLES.PROJECT_MANAGER, ROLES.ADMIN), validate(TeamValidator.addMember), TeamController.addMember);
router.delete('/:id/members/:userId', validateUUID('id'), validateUUID('userId'), restrictTo(ROLES.PROJECT_MANAGER, ROLES.ADMIN), TeamController.removeMember);

export default router;
