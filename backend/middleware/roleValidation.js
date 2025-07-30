const { ROLES } = require('../utils/constants');

const validateTeacherRole = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      error: 'Acceso denegado: Solo los profesores pueden realizar esta acción' 
    });
  }
  next();
};

const validateStudentRole = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      error: 'Acceso denegado: Solo los estudiantes pueden realizar esta acción' 
    });
  }
  next();
};

module.exports = {
  validateTeacherRole,
  validateStudentRole
};