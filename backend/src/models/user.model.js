const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { getDBConnection } = require('../config/db.config');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'developer';
    this.department = data.department || null;
    this.position = data.position || null;
    this.avatar = data.avatar || null;
    this.phone = data.phone || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastLogin = data.lastLogin || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(userData) {
    const connection = getDBConnection();
    
    // Hash password before storing
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
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

  async update(updateData) {
    const connection = getDBConnection();
    
    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
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

  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;