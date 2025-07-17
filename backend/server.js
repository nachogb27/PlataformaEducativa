const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // 🆕 Importar bcrypt
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { User, Role, Subject, StudentsTeachersRelation, Session, sequelize } = require('./index');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'tu_clave_secreta_jwt';
const TEACHER_TOKEN = '3rhb23uydb238ry6g2429hrh'; // Token global para profesores

// 🆕 Configuración de bcrypt
const SALT_ROUNDS = 12; // Número de rondas de salt (12 es un buen balance seguridad/performance)

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/avatars/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  }
});

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'plataforma.educativa.proyecto@gmail.com',
    pass: 'wyus erdh hgqp vvcs'
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

// 🆕 LOGIN ENDPOINT CON BCRYPT
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

    // 🔐 VALIDAR CONTRASEÑA CON BCRYPT
    const isPasswordValid = bcrypt.compareSync(password, user.password_token);
    
    if (!isPasswordValid) {
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

    console.log(`✅ Login exitoso para usuario: ${username}`);

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

// 🆕 REGISTRO DE USUARIO CON BCRYPT
app.post('/api/register', async (req, res) => {
  try {
    const { name, surnames, username, email, password, confirmPassword, role, teacherToken } = req.body;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // Validar email con regex
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Verificar que el username no exista
    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    }

    // Verificar token de profesor si el rol es teacher
    const roleId = role === 'teacher' ? 2 : 1;
    if (roleId === 2) {
      if (!teacherToken || teacherToken !== TEACHER_TOKEN) {
        return res.status(403).json({ error: 'Token de profesor inválido' });
      }
    }

    // 🔐 CIFRAR CONTRASEÑA CON BCRYPT
    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
    console.log(`🔐 Contraseña cifrada para usuario: ${username}`);

    // Generar token de activación
    const activationToken = uuidv4();

    // Crear usuario con contraseña cifrada
    const newUser = await User.create({
      name,
      surnames,
      username,
      email,
      role: roleId,
      password_token: hashedPassword, // 🔐 Guardar hash en lugar de texto plano
      access_token: activationToken,
      active: 0
    });

    // Enviar email de activación
    const activationUrl = `http://localhost:8080/activate-account?token=${activationToken}`;
    
    const mailOptions = {
      from: 'plataforma.educativa.proyecto@gmail.com',
      to: email,
      subject: 'Activar cuenta - Plataforma Educativa',
      html: `
        <h2>¡Bienvenido a la Plataforma Educativa!</h2>
        <p>Hola ${name},</p>
        <p>Tu cuenta ha sido creada exitosamente. Para completar el registro, necesitas activar tu cuenta.</p>
        <p>Haz clic en el siguiente botón para activar tu cuenta:</p>
        <a href="${activationUrl}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Activar Cuenta
        </a>
        <p>Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:</p>
        <p>${activationUrl}</p>
        <p>Saludos,<br>Equipo de Plataforma Educativa</p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Usuario registrado: ${username} con contraseña cifrada`);

    res.json({ 
      message: 'Usuario registrado exitosamente. Revisa tu email para activar la cuenta.',
      userId: newUser.id 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ACTIVACIÓN DE CUENTA (sin cambios)
app.post('/api/activate-account', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Buscar usuario por token de activación
    const user = await User.findOne({
      where: { access_token: token, active: 0 }
    });

    if (!user) {
      return res.status(403).json({ error: 'Token de activación inválido o cuenta ya activada' });
    }

    // Activar usuario
    user.active = 1;
    await user.save();

    console.log(`✅ Cuenta activada para usuario ID: ${user.id}`);

    res.json({ message: 'Cuenta activada exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error en activación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// SOLICITUD DE RECUPERACIÓN DE CONTRASEÑA (sin cambios)
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
    user.password_token = resetToken; // 🔄 Esto se cambiará en el siguiente endpoint
    await user.save();

    // Configurar email
    const resetUrl = `http://localhost:8080/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: 'plataforma.educativa.proyecto@gmail.com',
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

    console.log(`📧 Email de recuperación enviado a: ${email}`);

    res.json({ message: 'Email de recuperación enviado exitosamente' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🆕 RESTABLECER CONTRASEÑA CON BCRYPT
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

    // 🔐 CIFRAR NUEVA CONTRASEÑA CON BCRYPT
    const hashedPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
    
    // Actualizar contraseña cifrada
    user.password_token = hashedPassword;
    await user.save();

    console.log(`🔐 Contraseña actualizada y cifrada para usuario ID: ${user.id}`);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// EDITAR ESTUDIANTE (sin cambios)
app.put('/api/teacher/student/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const studentId = req.params.id;
    const { name, surnames } = req.body;

    // Verificar que el profesor puede editar este estudiante
    const relation = await StudentsTeachersRelation.findOne({
      where: { 
        id_teacher: decoded.userId,
        id_student: studentId 
      }
    });

    if (!relation) {
      return res.status(403).json({ error: 'No tienes permisos para editar este estudiante' });
    }

    // Actualizar estudiante
    const student = await User.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    student.name = name;
    student.surnames = surnames;
    await student.save();

    res.json({ message: 'Estudiante actualizado exitosamente', student });
  } catch (error) {
    console.error('Error editando estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ELIMINAR ESTUDIANTE (sin cambios)
app.delete('/api/teacher/student/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const studentId = req.params.id;

    // Eliminar la relación estudiante-profesor
    const deletedRows = await StudentsTeachersRelation.destroy({
      where: { 
        id_teacher: decoded.userId,
        id_student: studentId 
      }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Relación no encontrada' });
    }

    res.json({ message: 'Estudiante eliminado de tu lista exitosamente' });
  } catch (error) {
    console.error('Error eliminando estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER PERFIL DE USUARIO (sin cambios)
app.get('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const profileData = {
      id: user.id,
      name: user.name,
      surnames: user.surnames,
      email: user.email,
      username: user.username,
      role: user.roleData.role_name,
      avatar: user.avatar ? `http://localhost:${PORT}/uploads/avatars/${user.avatar}` : null
    };

    // Si es profesor, agregar estadísticas de asignaturas
    if (user.roleData.role_name === 'teacher') {
      const relations = await StudentsTeachersRelation.findAll({
        where: { id_teacher: user.id },
        include: [{
          model: Subject,
          as: 'subject'
        }]
      });

      // Agrupar por asignatura y contar estudiantes
      const subjectCounts = {};
      relations.forEach(relation => {
        const subjectName = relation.subject.subject_name;
        if (subjectCounts[subjectName]) {
          subjectCounts[subjectName]++;
        } else {
          subjectCounts[subjectName] = 1;
        }
      });

      profileData.subjectStats = Object.entries(subjectCounts).map(([subjectName, studentCount]) => ({
        subjectName,
        studentCount
      }));
    }

    res.json(profileData);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ACTUALIZAR AVATAR (sin cambios)
app.post('/api/profile/avatar', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { image, filename } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No se ha enviado ninguna imagen' });
    }

    // Verificar que es base64 válido
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
    if (!base64Regex.test(image)) {
      return res.status(400).json({ error: 'Formato de imagen inválido. Use base64.' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Extraer el tipo de imagen y los datos base64
    const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    const imageType = matches[1];
    const base64Data = matches[2];

    // Crear directorio si no existe
    const uploadDir = './uploads/avatars/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + imageType;
    const filePath = path.join(uploadDir, uniqueName);

    // Eliminar avatar anterior si existe
    if (user.avatar) {
      const oldAvatarPath = path.join(uploadDir, user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Convertir base64 a archivo y guardarlo
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    // Actualizar usuario con nuevo avatar
    user.avatar = uniqueName;
    await user.save();

    const avatarUrl = `http://localhost:${PORT}/uploads/avatars/${uniqueName}`;
    
    res.json({ 
      message: 'Avatar actualizado exitosamente',
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('Error actualizando avatar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ACTUALIZAR PERFIL (sin cambios)
app.put('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, surnames } = req.body;

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.name = name;
    user.surnames = surnames;
    await user.save();

    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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

// OBTENER PROFESORES DEL ESTUDIANTE (sin cambios)
app.get('/api/student/teachers', async (req, res) => {
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
          attributes: ['id', 'name', 'surnames', 'email', 'avatar']
        }
      ]
    });

    const teachers = relations.map(relation => ({
      teacherId: relation.teacher.id,
      subjectId: relation.subject.id,
      name: relation.teacher.name,
      surnames: relation.teacher.surnames,
      email: relation.teacher.email,
      avatar: relation.teacher.avatar ? `http://localhost:${PORT}/uploads/avatars/${relation.teacher.avatar}` : null,
      subjectName: relation.subject.subject_name
    }));

    res.json(teachers);
  } catch (error) {
    console.error('Error obteniendo profesores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER ASIGNATURAS DEL ESTUDIANTE (sin cambios)
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

// OBTENER ESTUDIANTES DEL PROFESOR (sin cambios)
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
          attributes: ['id', 'name', 'surnames', 'email', 'avatar']
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
      avatar: relation.student.avatar ? `http://localhost:${PORT}/uploads/avatars/${relation.student.avatar}` : null,
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
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔐 Cifrado de contraseñas: ACTIVADO (bcrypt con ${SALT_ROUNDS} rounds)`);
});