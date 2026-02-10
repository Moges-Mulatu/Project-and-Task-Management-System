import Report from '../models/report.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import { ROLES } from '../constants/roles.constants.js';

/**
 * Report Service
 * Handles business logic for data analysis, trend reporting, and automated summaries.
 */
class ReportService {
    /**
     * Create a new report record
     * @param {Object} reportData - Report configuration
     * @returns {Promise<Report>} Created report instance
     */
    static async createReport(reportData) {
        try {
            return await Report.create(reportData);
        } catch (error) {
            throw new Error(`Error creating report: ${error.message}`);
        }
    }

    /**
     * Get all reports with optional filtering
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>} List of report instances
     */
    static async getReports(filters = {}) {
        try {
            return await Report.findAll(filters);
        } catch (error) {
            throw new Error(`Error fetching reports: ${error.message}`);
        }
    }

    /**
     * Get report by ID with ownership check
     * @param {string} id - Report ID
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Report>} Report instance
     */
    static async getReportById(id, requesterId, requesterRole) {
        try {
            const report = await Report.findById(id);
            if (!report) {
                throw new Error('Report not found');
            }

            // Ownership check for PMs
            if (requesterRole === ROLES.PROJECT_MANAGER && report.projectId) {
                const project = await Project.findById(report.projectId);
                if (project && project.projectManagerId !== requesterId) {
                    throw new Error('You can only view reports for projects you manage');
                }
            }
            // Admin can view any report

            return report;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a report record
     * @param {string} id - Report ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteReport(id) {
        try {
            const report = await Report.findById(id);
            if (!report) {
                throw new Error('Report not found');
            }
            return await report.delete();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generate a real-time project summary report
     * @param {string} projectId - Project ID
     * @param {string} generatedBy - User ID who requested the report
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Report>} The generated report record
     */
    static async generateProjectSummary(projectId, generatedBy, requesterRole) {
        try {
            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error('Project not found');
            }

            // Ownership check for PMs
            if (requesterRole === ROLES.PROJECT_MANAGER && project.projectManagerId !== generatedBy) {
                throw new Error('You can only generate reports for projects you manage');
            }
            // Admin can generate reports for any project

            const tasks = await Task.findAll({ projectId });

            // Logic to calculate stats
            const stats = {
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                pendingTasks: tasks.filter(t => t.status !== 'completed').length,
                projectProgress: project.progress,
                priorityDistribution: {
                    high: tasks.filter(t => t.priority === 'high').length,
                    medium: tasks.filter(t => t.priority === 'medium').length,
                    low: tasks.filter(t => t.priority === 'low').length
                }
            };

            return await Report.create({
                title: `Summary Report: ${project.name}`,
                type: 'project_summary',
                generatedBy,
                projectId,
                reportData: stats,
                status: 'completed'
            });
        } catch (error) {
            throw error;
        }
    }
}

export default ReportService;
