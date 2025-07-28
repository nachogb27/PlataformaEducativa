// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User, Role } = require('../index'); // Volver a importar desde el archivo principal

const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 Middleware authenticateToken ejecutándose...');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('📋 Auth header:', authHeader ? 'Presente' : 'Ausente');
    console.log('🎫 Token extraído:', token ? 'Presente' : 'Ausente');

    if (!token) {
      console.log('❌ No se encontró token');
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);
    
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (user.active !== 1) {
      console.log('❌ Cuenta no activada');
      return res.status(403).json({ error: 'Cuenta no activada' });
    }

    // 🔧 ARREGLO: Configurar tanto 'id' como 'userId' para compatibilidad
    req.user = {
      id: user.id,
      userId: user.id, // ← AÑADIDO: Para compatibilidad con el controller
      username: user.username,
      name: user.name,
      surnames: user.surnames,
      email: user.email,
      role: user.roleData.role_name,
      avatar: user.avatar
    };

    console.log('👤 req.user configurado:', req.user);
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    
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