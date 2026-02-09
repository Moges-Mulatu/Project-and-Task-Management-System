import express from 'express';
import ReportController from '../controllers/report.controller.js';
import ReportValidator from '../validators/report.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateUUID } from '../middlewares/paramValidator.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = express.Router();

// All report routes are protected and restricted to PMs and Admins
router.use(protect);
router.use(restrictTo(ROLES.PROJECT_MANAGER, ROLES.ADMIN));

router.get('/', ReportController.getAll);
router.get('/:id', validateUUID('id'), ReportController.getById);
router.post('/', validate(ReportValidator.create), ReportController.create);
router.delete('/:id', validateUUID('id'), ReportController.delete);

// Real-time generation
router.post('/projects/:projectId/summary', validateUUID('projectId'), ReportController.generateSummary);

export default router;
