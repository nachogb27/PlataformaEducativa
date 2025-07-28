const { Role } = require('../models');

class RoleRepository {
  async findByName(roleName) {
    return await Role.findOne({
      where: { role_name: roleName }
    });
  }

  async findById(id) {
    return await Role.findByPk(id);
  }

  async findAll() {
    return await Role.findAll();
  }
}

module.exports = new RoleRepository();
