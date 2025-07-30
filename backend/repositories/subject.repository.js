const { Subject } = require('../models');

class SubjectRepository {
  async findAll() {
    return await Subject.findAll({
      order: [['subject_name', 'ASC']]
    });
  }

  async findById(id) {
    return await Subject.findByPk(id);
  }

  async findByName(name) {
    return await Subject.findOne({
      where: { subject_name: name }
    });
  }

  async create(subjectData) {
    return await Subject.create(subjectData);
  }

  async update(id, subjectData) {
    const [updatedRows] = await Subject.update(subjectData, {
      where: { id }
    });
    
    if (updatedRows === 0) {
      return null;
    }
    
    return await this.findById(id);
  }

  async delete(id) {
    return await Subject.destroy({
      where: { id }
    });
  }
}

module.exports = new SubjectRepository();