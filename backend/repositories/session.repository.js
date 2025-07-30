const { Session } = require('../models');

class SessionRepository {
  async create(userId) {
    return await Session.create({
      id_user: userId,
      signed_at: new Date()
    });
  }

  async closeSession(userId) {
    return await Session.destroy({
      where: { id_user: userId }
    });
  }

  async getActiveSession(userId) {
    return await Session.findOne({
      where: { id_user: userId }
    });
  }
}

module.exports = new SessionRepository();