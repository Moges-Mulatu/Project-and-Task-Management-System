import ReportService from "../services/report.service.js";
import { sendSuccess, sendError } from "../utils/response.util.js";
import Project from "../models/project.model.js";

/**
 * Report Controller
 * Handles HTTP requests related to data analysis and automated report generation.
 */
class ReportController {
  /**
   * Create a new report configuration
   */
  static async create(req, res) {
    try {
      const reportData = {
        ...req.body,
        generatedBy: req.user.id,
      };
      const report = await ReportService.createReport(reportData);
      return sendSuccess(res, "Report created successfully", report, 201);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  /**
   * Get all reports
   */
  static async getAll(req, res) {
    try {
      let filters = { ...req.query };

      if (req.user.role === "project_manager") {
        const projects = await Project.findAll({
          projectManagerId: req.user.id,
        });
        const projectIds = projects.map((project) => project.id);

        if (projectIds.length === 0) {
          return sendSuccess(res, "Reports retrieved successfully", []);
        }

        filters.projectIds = projectIds;
      }

      const reports = await ReportService.getReports(filters);
      return sendSuccess(res, "Reports retrieved successfully", reports);
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  /**
   * Get report by ID
   */
  static async getById(req, res) {
    try {
      const report = await ReportService.getReportById(req.params.id);
      return sendSuccess(res, "Report retrieved successfully", report);
    } catch (error) {
      return sendError(res, error.message, 404);
    }
  }

  /**
   * Delete a report
   */
  static async delete(req, res) {
    try {
      await ReportService.deleteReport(req.params.id);
      return sendSuccess(res, "Report deleted successfully");
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  /**
   * Generate a real-time project summary report
   */
  static async generateSummary(req, res) {
    try {
      const { projectId } = req.params;
      const report = await ReportService.generateProjectSummary(
        projectId,
        req.user.id,
        req.user.role,
      );
      return sendSuccess(
        res,
        "Project summary generated successfully",
        report,
        201,
      );
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }
}

export default ReportController;
