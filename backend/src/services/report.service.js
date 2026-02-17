import Report from '../models/report.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';

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
     * Get report by ID
     * @param {string} id - Report ID
     * @returns {Promise<Report>} Report instance
     */
    static async getReportById(id) {
        try {
            const report = await Report.findById(id);
            if (!report) {
                throw new Error('Report not found');
            }
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
     * @returns {Promise<Report>} The generated report record
     */
    static async generateProjectSummary(projectId, generatedBy) {
        try {
            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error('Project not found');
            }

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
