const { Role } = require('../models');

class RoleRepository {
  async findById(id) {
    return await Role.findByPk(id);
  }

  async findByName(roleName) {
    return await Role.findOne({
      where: { role_name: roleName }
    });
  }

  async findAll() {
    return await Role.findAll();
  }
} 

module.exports = new RoleRepository();