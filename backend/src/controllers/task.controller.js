import TaskService from "../services/task.service.js";
import { sendSuccess, sendError } from "../utils/response.util.js";
import { getDBConnection } from "../config/db.config.js";

/**
 * Task Controller
 * Handles HTTP requests related to task management, assignment, and collaboration.
 */
class TaskController {
  /**
   * Create a new task
   */
  static async create(req, res) {
    try {
      const taskData = {
        ...req.body,
        assignedBy: req.user.id,
      };
      const task = await TaskService.createTask(
        taskData,
        req.user.id,
        req.user.role,
      );
      return sendSuccess(res, "Task created successfully", task, 201);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  /**
   * Get all tasks with role-based visibility
   */
  static async getAll(req, res) {
    try {
      let userTeamIds = [];

      if (req.user.role === "team_member") {
        const connection = getDBConnection();
        const [rows] = await connection.execute(
          "SELECT teamId FROM team_members WHERE userId = ? AND isActive = 1",
          [req.user.id],
        );
        userTeamIds = rows.map((row) => row.teamId);
      }

      const filters = {
        projectId: req.query.projectId,
        status: req.query.status,
        priority: req.query.priority,
        type: req.query.type,
        userRole: req.user.role,
        requesterId: req.user.id,
        assignedToUserId:
          req.user.role === "team_member" ? req.user.id : undefined,
        assignedToTeamIds:
          req.user.role === "team_member" ? userTeamIds : undefined,
        projectManagerId:
          req.user.role === "project_manager" ? req.user.id : undefined,
      };
      const tasks = await TaskService.getTasks(filters);
      return sendSuccess(res, "Tasks retrieved successfully", tasks);
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  /**
   * Get task by ID
   */
  static async getById(req, res) {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      return sendSuccess(res, "Task retrieved successfully", task);
    } catch (error) {
      return sendError(res, error.message, 404);
    }
  }

  /**
   * Update task details
   */
  static async update(req, res) {
    try {
      const task = await TaskService.updateTask(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role,
      );
      return sendSuccess(res, "Task updated successfully", task);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a task
   */
  static async delete(req, res) {
    try {
      await TaskService.deleteTask(req.params.id);
      return sendSuccess(res, "Task deleted successfully");
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  /**
   * Add a comment to a task
   */
  static async addComment(req, res) {
    try {
      const comment = {
        text: req.body.text,
        userId: req.user.id,
      };
      const task = await TaskService.addComment(req.params.id, comment);
      return sendSuccess(res, "Comment added successfully", task);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  /**
   * Add an attachment to a task
   */
  static async addAttachment(req, res) {
    try {
      const attachment = {
        ...req.body,
        uploadedBy: req.user.id,
      };
      const task = await TaskService.addAttachment(req.params.id, attachment);
      return sendSuccess(res, "Attachment added successfully", task);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }
}

export default TaskController;
