import express from "express";
import UserController from "../controllers/user.controller.js";
import UserValidator from "../validators/user.validator.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateUUID } from "../middlewares/paramValidator.middleware.js";
import { ROLES } from "../constants/roles.constants.js";

const router = express.Router();

// All user routes are protected
router.use(protect);

// Profile routes
router.get("/me", UserController.getMyProfile);
router.patch(
  "/me",
  validate(UserValidator.updateProfile),
  UserController.updateMyProfile,
);

// User management (Admin only)
router.get("/", restrictTo(ROLES.ADMIN), UserController.getAllUsers);
router.post("/", restrictTo(ROLES.ADMIN), validate(UserValidator.create), UserController.create);
router.get("/search", UserController.search);
router.get("/:id", validateUUID('id'), restrictTo(ROLES.ADMIN), UserController.getUser);
router.delete("/:id", validateUUID('id'), restrictTo(ROLES.ADMIN), UserController.deactivateUser);
router.patch("/:id/role", validateUUID('id'), restrictTo(ROLES.ADMIN), validate(UserValidator.updateRole), UserController.updateUserRole);
router.patch("/:id/reactivate", validateUUID('id'), restrictTo(ROLES.ADMIN), UserController.reactivateUser);

export default router;
