const { Session } = require('../models');

class SessionRepository {
  async createSession(userId) {
    return await Session.create({
      userId,
      loginAt: new Date(),
      logoutAt: null
    });
  }

  async closeSession(userId) {
    const session = await Session.findOne({
      where: {
        userId,
        logoutAt: null
      },
      order: [['loginAt', 'DESC']]
    });

    if (session) {
      session.logoutAt = new Date();
      await session.save();
    }

    return session;
  }
}

module.exports = new SessionRepository();
