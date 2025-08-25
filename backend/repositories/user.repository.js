const { User, Role } = require('../models');

class UserRepository {
  async findById(id) {
    return await User.findByPk(id, {
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
  }

  async findByUsername(username) {
    return await User.findOne({
      where: { username },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
  }

  async findByEmail(email) {
    return await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, userData) {
    const [updatedRows] = await User.update(userData, {
      where: { id }
    });
    
    if (updatedRows === 0) {
      return null;
    }
    
    return await this.findById(id);
  }

  async delete(id) {
    return await User.destroy({
      where: { id }
    });
  }

  async findByAccessToken(token) {
    return await User.findOne({
      where: { access_token: token }
    });
  }

  async findByPasswordToken(token) {
    return await User.findOne({
      where: { password_token: token }
    });
  }

  async findStudentsByRole() {
    return await User.findAll({
      where: { role: 1 }, 
      attributes: ['id', 'name', 'surnames', 'email', 'avatar'],
      order: [['name', 'ASC'], ['surnames', 'ASC']]
    });
  }

  async findTeachersByRole() {
    return await User.findAll({
      where: { role: 2 }, 
      attributes: ['id', 'name', 'surnames', 'email', 'avatar'],
      order: [['name', 'ASC'], ['surnames', 'ASC']]
    });
  }
}

module.exports = new UserRepository();