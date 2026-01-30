/**
 * Report Validator
 * Defines validation rules for report generation routes.
 */
class ReportValidator {
    /**
     * Rules for report creation
     */
    static get create() {
        return [
            { field: 'name', required: true, type: 'string' },
            { field: 'type', required: true, enum: ['project_summary', 'team_performance', 'task_bottlenecks'] },
            { field: 'projectId', required: false }
        ];
    }
}

export default ReportValidator;
