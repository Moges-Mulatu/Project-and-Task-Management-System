import { v4 as uuidv4 } from "uuid";
import { getDBConnection } from "../config/db.config.js";
import Project from "./project.model.js";

/**
 * Task Model
 * Manages individual tasks within a project, including assignment and progress tracking.
 */
class Task {
  /**
   * Create a new Task instance
   * @param {Object} data - Task data object
   */
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description || null;
    this.projectId = data.projectId;
    this.assignedTo = data.assignedTo || null;
    this.assignedBy = data.assignedBy;
    this.status = data.status || "todo";
    this.priority = data.priority || "medium";
    this.type = data.type || "feature";
    this.estimatedHours = data.estimatedHours || null;
    this.actualHours = data.actualHours || 0;
    this.startDate = data.startDate || null;
    this.dueDate = data.dueDate || data.deadline || null;
    this.completedAt = data.completedAt || null;
    this.parentTaskId = data.parentTaskId || null;
    this.storyPoints = data.storyPoints || null;
    this.tags = data.tags || [];
    this.attachments = data.attachments || [];
    this.comments = data.comments || [];
    this.progress = data.progress || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.assignedToUsers = data.assignedToUsers || [];
    this.assignedToTeams = data.assignedToTeams || [];
  }

  /**
   * Create a new task in the database
   * @param {Object} taskData - Data for the new task
   * @returns {Promise<Task>} The created Task instance
   */
  static async create(taskData) {
    const connection = getDBConnection();
    const task = new Task(taskData);

    const query = `
      INSERT INTO tasks (
        id, title, description, projectId, assignedTo, assignedBy, status,
        priority, type, estimatedHours, actualHours, startDate, dueDate,
        completedAt, parentTaskId, storyPoints, tags, attachments, comments,
        progress, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      task.id,
      task.title,
      task.description,
      task.projectId,
      task.assignedTo,
      task.assignedBy,
      task.status,
      task.priority,
      task.type,
      task.estimatedHours,
      task.actualHours,
      task.startDate,
      task.dueDate,
      task.completedAt,
      task.parentTaskId,
      task.storyPoints,
      JSON.stringify(task.tags),
      JSON.stringify(task.attachments),
      JSON.stringify(task.comments),
      task.progress,
      task.createdAt,
      task.updatedAt,
    ];

    try {
      await connection.execute(query, values);

      // Handle multiple assignments if provided
      const assignedToUsers = taskData.assignedToUsers || [];
      const assignedToTeams = taskData.assignedToTeams || [];

      // Insert user assignments
      for (const userId of assignedToUsers) {
        const assignmentId = uuidv4();
        await connection.execute(
          "INSERT INTO task_assignments (id, taskId, assigneeType, assigneeId) VALUES (?, ?, ?, ?)",
          [assignmentId, task.id, "user", userId],
        );
      }

      // Insert team assignments
      for (const teamId of assignedToTeams) {
        const assignmentId = uuidv4();
        await connection.execute(
          "INSERT INTO task_assignments (id, taskId, assigneeType, assigneeId) VALUES (?, ?, ?, ?)",
          [assignmentId, task.id, "team", teamId],
        );
      }

      // Update project progress
      const project = await Project.findById(task.projectId);
      if (project) {
        await project.updateProgress();
      }

      return task;
    } catch (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  /**
   * Find a task by its ID
   * @param {string} id - The task ID
   * @returns {Promise<Task|null>} The task instance or null if not found
   */
  static async findById(id) {
    const connection = getDBConnection();
    const query = "SELECT * FROM tasks WHERE id = ? AND isActive = 1";

    try {
      const [rows] = await connection.execute(query, [id]);
      if (rows.length > 0) {
        const task = rows[0];
        task.tags = JSON.parse(task.tags || "[]");
        task.attachments = JSON.parse(task.attachments || "[]");
        task.comments = JSON.parse(task.comments || "[]");

        // Fetch task assignments
        const [assignments] = await connection.execute(
          "SELECT assigneeType, assigneeId FROM task_assignments WHERE taskId = ?",
          [id],
        );

        task.assignedToUsers = assignments
          .filter((a) => a.assigneeType === "user")
          .map((a) => a.assigneeId);
        task.assignedToTeams = assignments
          .filter((a) => a.assigneeType === "team")
          .map((a) => a.assigneeId);

        return new Task(task);
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find task: ${error.message}`);
    }
  }

  /**
   * Get all active tasks with optional filtering
   * @param {Object} options - Filter options (projectId, assignedTo, status, etc.)
   * @returns {Promise<Task[]>} Array of Task instances
   */
  static async findAll(options = {}) {
    const connection = getDBConnection();
    let query = "SELECT DISTINCT t.* FROM tasks t";
    const joins = [];
    const where = ["t.isActive = 1"];
    const values = [];

    if (options.projectId) {
      where.push("t.projectId = ?");
      values.push(options.projectId);
    }

    if (options.assignedTo) {
      where.push("t.assignedTo = ?");
      values.push(options.assignedTo);
    }

    if (options.projectManagerId) {
      joins.push("JOIN projects p ON p.id = t.projectId");
      where.push("p.projectManagerId = ?");
      values.push(options.projectManagerId);
    }

    if (
      options.assignedToUserId ||
      (options.assignedToTeamIds && options.assignedToTeamIds.length > 0)
    ) {
      joins.push("LEFT JOIN task_assignments ta ON ta.taskId = t.id");

      const assignmentConditions = [];

      if (options.assignedToUserId) {
        assignmentConditions.push("t.assignedTo = ?");
        assignmentConditions.push(
          "(ta.assigneeType = 'user' AND ta.assigneeId = ?)",
        );
        values.push(options.assignedToUserId, options.assignedToUserId);
      }

      if (options.assignedToTeamIds && options.assignedToTeamIds.length > 0) {
        const placeholders = options.assignedToTeamIds
          .map(() => "?")
          .join(", ");
        assignmentConditions.push(
          `(ta.assigneeType = 'team' AND ta.assigneeId IN (${placeholders}))`,
        );
        values.push(...options.assignedToTeamIds);
      }

      if (assignmentConditions.length > 0) {
        where.push(`(${assignmentConditions.join(" OR ")})`);
      }
    }

    if (options.status) {
      where.push("t.status = ?");
      values.push(options.status);
    }

    if (options.priority) {
      where.push("t.priority = ?");
      values.push(options.priority);
    }

    if (options.type) {
      where.push("t.type = ?");
      values.push(options.type);
    }

    if (options.parentTaskId) {
      where.push("t.parentTaskId = ?");
      values.push(options.parentTaskId);
    }

    if (joins.length > 0) {
      query += ` ${joins.join(" ")}`;
    }

    query += ` WHERE ${where.join(" AND ")}`;
    query += " ORDER BY t.createdAt DESC";

    if (options.limit) {
      query += " LIMIT ?";
      values.push(options.limit);
    }

    try {
      const [rows] = await connection.execute(query, values);

      // Fetch assignments for all tasks
      const taskIds = rows.map((row) => row.id);
      let assignments = [];

      if (taskIds.length > 0) {
        const placeholders = taskIds.map(() => "?").join(",");
        const [assignmentRows] = await connection.execute(
          `SELECT taskId, assigneeType, assigneeId FROM task_assignments WHERE taskId IN (${placeholders})`,
          taskIds,
        );
        assignments = assignmentRows;
      }

      return rows.map((row) => {
        row.tags = JSON.parse(row.tags || "[]");
        row.attachments = JSON.parse(row.attachments || "[]");
        row.comments = JSON.parse(row.comments || "[]");

        // Add assignments to each task
        const taskAssignments = assignments.filter((a) => a.taskId === row.id);
        row.assignedToUsers = taskAssignments
          .filter((a) => a.assigneeType === "user")
          .map((a) => a.assigneeId);
        row.assignedToTeams = taskAssignments
          .filter((a) => a.assigneeType === "team")
          .map((a) => a.assigneeId);

        return new Task(row);
      });
    } catch (error) {
      throw new Error(`Failed to find tasks: ${error.message}`);
    }
  }

  /**
   * Update task details
   * @param {Object} updateData - Key-value pairs to update
   * @returns {Promise<Task>} The updated task instance
   */
  async update(updateData) {
    const connection = getDBConnection();
    updateData.updatedAt = new Date();

    // Map deadline to dueDate if it exists
    if (updateData.deadline) {
      updateData.dueDate = updateData.deadline;
      delete updateData.deadline;
    }

    // Handle JSON fields
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    if (updateData.attachments) {
      updateData.attachments = JSON.stringify(updateData.attachments);
    }
    if (updateData.comments) {
      updateData.comments = JSON.stringify(updateData.comments);
    }

    // Set completedAt when status is completed
    if (updateData.status === "completed" && this.status !== "completed") {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    }

    const setClause = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updateData);
    values.push(this.id);

    const query = `UPDATE tasks SET ${setClause} WHERE id = ?`;

    try {
      await connection.execute(query, values);
      Object.assign(this, updateData);

      // Parse JSON fields back to objects
      if (this.tags && typeof this.tags === "string") {
        this.tags = JSON.parse(this.tags);
      }
      if (this.attachments && typeof this.attachments === "string") {
        this.attachments = JSON.parse(this.attachments);
      }
      if (this.comments && typeof this.comments === "string") {
        this.comments = JSON.parse(this.comments);
      }

      // Update project progress
      const project = await Project.findById(this.projectId);
      if (project) {
        await project.updateProgress();
      }

      return this;
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  /**
   * Soft delete a task (mark as inactive)
   * @returns {Promise<boolean>} Success status
   */
  async delete() {
    const connection = getDBConnection();
    const query = "UPDATE tasks SET isActive = 0, updatedAt = ? WHERE id = ?";

    try {
      await connection.execute(query, [new Date(), this.id]);
      this.isActive = false;

      // Update project progress
      const project = await Project.findById(this.projectId);
      if (project) {
        await project.updateProgress();
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  /**
   * Add a comment to this task
   * @param {Object} comment - The comment object (text, userId)
   * @returns {Promise<Task>} The updated task instance
   */
  async addComment(comment) {
    if (!this.comments) {
      this.comments = [];
    }
    this.comments.push({
      id: uuidv4(),
      text: comment.text,
      userId: comment.userId,
      createdAt: new Date(),
    });

    return await this.update({ comments: this.comments });
  }

  /**
   * Add an attachment to this task
   * @param {Object} attachment - The attachment object (filename, url, size, uploadedBy)
   * @returns {Promise<Task>} The updated task instance
   */
  async addAttachment(attachment) {
    if (!this.attachments) {
      this.attachments = [];
    }
    this.attachments.push({
      id: uuidv4(),
      filename: attachment.filename,
      url: attachment.url,
      size: attachment.size,
      uploadedBy: attachment.uploadedBy,
      uploadedAt: new Date(),
    });

    return await this.update({ attachments: this.attachments });
  }
}

export default Task;
