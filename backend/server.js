const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { User, Role, Subject, StudentsTeachersRelation, Session } = require('./index');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'tu_clave_secreta_jwt';

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu_email_del_proyecto@gmail.com',
    pass: 'tu_contraseña_de_aplicacion'
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Función para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario por username
    const user = await User.findOne({
      where: { username: username },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar si la cuenta está activada
    if (user.active === 0) {
      return res.status(403).json({ error: 'La cuenta no está activada' });
    }

    // Validar contraseña
    if (user.password_token !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Crear sesión
    await Session.createSession(user.id);

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, role: user.roleData.role_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        surnames: user.surnames,
        email: user.email,
        role: user.roleData.role_name
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// SOLICITUD DE RECUPERACIÓN DE CONTRASEÑA
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validar email con regex
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Buscar usuario por email
    const user = await User.findOne({
      where: { email: email }
    });

    if (!user) {
      return res.status(404).json({ error: 'No existe un usuario con este email' });
    }

    // Verificar si la cuenta está activada
    if (user.active === 0) {
      return res.status(403).json({ error: 'La cuenta no está activada' });
    }

    // Generar token de reset
    const resetToken = uuidv4();
    user.password_token = resetToken;
    await user.save();

    // Configurar email
    const resetUrl = `http://localhost:8080/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: 'tu_email@gmail.com',
      to: email,
      subject: 'Recuperación de contraseña - Plataforma Educativa',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${user.name},</p>
        <p>Has solicitado restablecer tu contraseña en la Plataforma Educativa.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Restablecer Contraseña
        </a>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        <p>Saludos,<br>Equipo de Plataforma Educativa</p>
      `
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email de recuperación enviado exitosamente' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RESTABLECER CONTRASEÑA
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // Validar contraseña con regex (mínimo 8 caracteres, al menos una mayúscula, minúscula y número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número' 
      });
    }

    // Buscar usuario por token
    const user = await User.findOne({
      where: { password_token: token }
    });

    if (!user) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    // Actualizar contraseña
    user.password_token = newPassword; // En producción, usar hash
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// LOGOUT ENDPOINT
app.post('/api/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    await Session.closeSession(decoded.userId);
    
    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

// OBTENER ASIGNATURAS DEL ESTUDIANTE
app.get('/api/student/subjects', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const relations = await StudentsTeachersRelation.findAll({
      where: { id_student: decoded.userId },
      include: [
        {
          model: Subject,
          as: 'subject'
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['name', 'surnames']
        }
      ]
    });

    const subjects = relations.map(relation => ({
      id: relation.subject.id,
      name: relation.subject.subject_name,
      teacher: `${relation.teacher.name} ${relation.teacher.surnames}`,
      credits: Math.floor(Math.random() * 6) + 3, // Temporal
      status: 'Cursando'
    }));

    res.json(subjects);
  } catch (error) {
    console.error('Error obteniendo asignaturas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER ESTUDIANTES DEL PROFESOR
app.get('/api/teacher/students', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const relations = await StudentsTeachersRelation.findAll({
      where: { id_teacher: decoded.userId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'surnames', 'email']
        },
        {
          model: Subject,
          as: 'subject'
        }
      ]
    });

    const students = relations.map(relation => ({
      id: relation.student.id,
      name: relation.student.name,
      lastName: relation.student.surnames,
      email: relation.student.email,
      subject: relation.subject.subject_name,
      grade: (Math.random() * 3 + 7).toFixed(1) // Temporal
    }));

    res.json(students);
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});