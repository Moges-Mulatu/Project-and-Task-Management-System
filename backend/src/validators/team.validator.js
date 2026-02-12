/**
 * Team Validator
 * Defines validation rules for team management routes.
 */
class TeamValidator {
  /**
   * Rules for team creation
   */
  static get create() {
    return [
      { field: "name", required: true, type: "string" },
      { field: "description", required: false, type: "string" },
      { field: "department", required: true, type: "string" },
      { field: "teamLeadId", required: true },
    ];
  }

  /**
   * Rules for adding a member
   */
  static get addMember() {
    return [
      { field: "userId", required: true },
      { field: "role", required: false, enum: ["lead", "member"] },
    ];
  }
}

export default TeamValidator;
