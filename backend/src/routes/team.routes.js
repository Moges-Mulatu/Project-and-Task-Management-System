import TeamController from '../controllers/team.controller.js';
import TeamValidator from '../validators/team.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

// All team routes are protected
router.use(protect);

router.get('/', TeamController.getAll);
router.get('/:id', TeamController.getById);

// Admin/PM only team creation
router.post('/', restrictTo('project_manager', 'admin'), validate(TeamValidator.create), TeamController.create);
router.patch('/:id', restrictTo('project_manager', 'admin'), TeamController.update);
router.delete('/:id', restrictTo('admin'), TeamController.delete);

// Membership management
router.get('/:id/members', TeamController.getMembers);
router.post('/:id/members', restrictTo('project_manager', 'admin'), validate(TeamValidator.addMember), TeamController.addMember);
router.delete('/:id/members/:userId', restrictTo('project_manager', 'admin'), TeamController.removeMember);

export default router;
