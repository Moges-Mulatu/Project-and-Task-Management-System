import HashUtil from '../utils/hash.util.js';
import { v4 as uuidv4 } from 'uuid';
import { getDBConnection } from '../config/db.config.js';
import { ROLES } from '../constants/roles.constants.js';

/**
 * User Model
 * Represents a user in the system with authentication and profile details.
 */
class User {
  /**
   * Create a new User instance
   * @param {Object} data - User data object
   */
  constructor(data) {
    this.id = data.id || uuidv4();
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.role = (data.role || ROLES.TEAM_MEMBER).toLowerCase();
    this.department = data.department || null;
    this.position = data.position || null;
    this.avatar = data.avatar || null;
    this.phone = data.phone || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastLogin = data.lastLogin || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Create a new user in the database
   * @param {Object} userData - Data for the new user
   * @returns {Promise<User>} The created User instance
   */
  static async create(userData) {
    const connection = getDBConnection();

    // Hash password before storing
    if (userData.password) {
      userData.password = await HashUtil.hash(userData.password);
    }

    const user = new User(userData);

    const query = `
      INSERT INTO users (
        id, firstName, lastName, email, password, role, department, 
        position, avatar, phone, isActive, lastLogin, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user.id, user.firstName, user.lastName, user.email, user.password,
      user.role, user.department, user.position, user.avatar, user.phone,
      user.isActive, user.lastLogin, user.createdAt, user.updatedAt
    ];

    try {
      await connection.execute(query, values);
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Find a user by their ID
   * @param {string} id - The user ID
   * @returns {Promise<User|null>} The user instance or null if not found
   */
  static async findById(id) {
    const connection = getDBConnection();
    const query = 'SELECT * FROM users WHERE id = ? AND isActive = 1';

    try {
      const [rows] = await connection.execute(query, [id]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  /**
   * Find a user by their email address
   * @param {string} email - The email address
   * @returns {Promise<User|null>} The user instance or null if not found
   */
  static async findByEmail(email) {
    const connection = getDBConnection();
    const query = 'SELECT * FROM users WHERE email = ? AND isActive = 1';

    try {
      const [rows] = await connection.execute(query, [email]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Get all active users in the system
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<User[]>} Array of User instances
   */
  static async findAll(options = {}) {
    const connection = getDBConnection();
    let query = 'SELECT * FROM users WHERE isActive = 1';
    const values = [];

    if (options.role) {
      query += ' AND role = ?';
      values.push(options.role);
    }

    if (options.department) {
      query += ' AND department = ?';
      values.push(options.department);
    }

    query += ' ORDER BY createdAt DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      values.push(options.limit);
    }

    try {
      const [rows] = await connection.execute(query, values);
      return rows.map(row => new User(row));
    } catch (error) {
      throw new Error(`Failed to find users: ${error.message}`);
    }
  }

  /**
   * Update user details
   * @param {Object} updateData - Key-value pairs to update
   * @returns {Promise<User>} The updated user instance
   */
  async update(updateData) {
    const connection = getDBConnection();

    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await HashUtil.hash(updateData.password);
    }

    updateData.updatedAt = new Date();

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(this.id);

    const query = `UPDATE users SET ${setClause} WHERE id = ?`;

    try {
      await connection.execute(query, values);
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Soft delete a user (mark as inactive)
   * @returns {Promise<boolean>} Success status
   */
  async delete() {
    const connection = getDBConnection();
    const query = 'UPDATE users SET isActive = 0, updatedAt = ? WHERE id = ?';

    try {
      await connection.execute(query, [new Date(), this.id]);
      this.isActive = false;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Validate provided password against hashed stored password
   * @param {string} password - The plain-text password to check
   * @returns {Promise<boolean>} Valid status
   */
  async validatePassword(password) {
    return await HashUtil.compare(password, this.password);
  }

  /**
   * Strip sensitive data (like password) for API responses
   * @returns {Object} JSON-friendly user object
   */
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}


export default User;
