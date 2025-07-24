// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User, Role } = require('../index');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (user.active !== 1) {
      return res.status(403).json({ error: 'Cuenta no activada' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      surnames: user.surnames,
      email: user.email,
      role: user.roleData.role_name,
      avatar: user.avatar
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  authenticateToken
};