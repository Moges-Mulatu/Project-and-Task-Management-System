import UserController from '../controllers/user.controller.js';
import UserValidator from '../validators/user.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

// All user routes are protected
router.use(protect);

// Profile routes
router.get('/me', UserController.getMyProfile);
router.patch('/me', validate(UserValidator.updateProfile), UserController.updateMyProfile);

// User management (Admin only)
router.get('/', restrictTo('admin'), UserController.getAllUsers);
router.get('/search', UserController.search); // Search is generally available for protected users
router.get('/:id', restrictTo('admin'), UserController.getUser);
router.delete('/:id', restrictTo('admin'), UserController.deactivateUser);

export default router;
