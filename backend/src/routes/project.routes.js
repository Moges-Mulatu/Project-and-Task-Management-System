import express from 'express';
import ProjectController from '../controllers/project.controller.js';
import ProjectValidator from '../validators/project.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateUUID } from '../middlewares/paramValidator.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = express.Router();

// All project routes are protected
router.use(protect);

// Publicly viewable for authenticated users
router.get('/', ProjectController.getAll);
router.get('/:id', validateUUID('id'), ProjectController.getById);

// PM only routes for project management
router.post('/', restrictTo(ROLES.PROJECT_MANAGER), validate(ProjectValidator.create), ProjectController.create);
router.patch('/:id', validateUUID('id'), restrictTo(ROLES.PROJECT_MANAGER), validate(ProjectValidator.update), ProjectController.update);
router.delete('/:id', validateUUID('id'), restrictTo(ROLES.PROJECT_MANAGER), ProjectController.delete);

// Progress management - PM only
router.post('/:id/refresh-progress', validateUUID('id'), restrictTo(ROLES.PROJECT_MANAGER), ProjectController.refreshProgress);

export default router;
