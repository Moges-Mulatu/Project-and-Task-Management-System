import TaskController from '../controllers/task.controller.js';
import TaskValidator from '../validators/task.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

// All task routes are protected
router.use(protect);

// Basic CRUD
router.get('/', TaskController.getAll);
router.post('/', restrictTo('project_manager', 'admin'), validate(TaskValidator.create), TaskController.create);
router.get('/:id', TaskController.getById);
router.patch('/:id', validate(TaskValidator.update), TaskController.update);
router.delete('/:id', restrictTo('project_manager', 'admin'), TaskController.delete);

// Collaboration items
router.post('/:id/comments', validate(TaskValidator.addComment), TaskController.addComment);
router.post('/:id/attachments', TaskController.addAttachment);

export default router;
