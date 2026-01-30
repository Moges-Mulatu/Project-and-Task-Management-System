import ProjectController from '../controllers/project.controller.js';
import ProjectValidator from '../validators/project.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

// All project routes are protected
router.use(protect);

// Publicly viewable for authenticated users
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);

// PM and Admin only routes
router.post('/', restrictTo('project_manager', 'admin'), validate(ProjectValidator.create), ProjectController.create);
router.patch('/:id', restrictTo('project_manager', 'admin'), validate(ProjectValidator.update), ProjectController.update);
router.delete('/:id', restrictTo('admin'), ProjectController.delete);

// Progress management
router.post('/:id/refresh-progress', restrictTo('project_manager', 'admin'), ProjectController.refreshProgress);

export default router;
