import ReportController from '../controllers/report.controller.js';
import ReportValidator from '../validators/report.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

// All report routes are protected and restricted to PMs and Admins
router.use(protect);
router.use(restrictTo('project_manager', 'admin'));

router.get('/', ReportController.getAll);
router.get('/:id', ReportController.getById);
router.post('/', validate(ReportValidator.create), ReportController.create);
router.delete('/:id', ReportController.delete);

// Real-time generation
router.post('/projects/:projectId/summary', ReportController.generateSummary);

export default router;
