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
    const activationUrl = `http://localhost:3000/api/activate-account?token=${activationToken}`;

    
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
app.get('/api/activate-account', async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      where: { access_token: token, active: 0 }
    });

    if (!user) {
      return res.status(403).send('Token inválido o cuenta ya activada.');
    }

    user.active = 1;
    await user.save();

    console.log(`✅ Cuenta activada para usuario ID: ${user.id}`);

     // 🔁 Redirige al login del frontend
    res.redirect('http://localhost:8080/login?activated=true');
  } catch (error) {
    console.error('Error en activación vía GET:', error);
    res.status(500).send('Error interno del servidor');
  }
});


/*
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
*/

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
    const resetUrl = `http://localhost:8080/#/reset-password?token=${resetToken}`;
    
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

// ============= ENDPOINTS DE ASIGNATURAS MEJORADOS =============

// ============= ENDPOINTS FALTANTES EN server.js =============

// OBTENER TODAS LAS ASIGNATURAS (básico)
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      order: [['subject_name', 'ASC']]
    });
    res.json(subjects);
  } catch (error) {
    console.error('Error obteniendo asignaturas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// CREAR UNA NUEVA ASIGNATURA (profesor)
app.post('/api/subjects', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { name } = req.body;
    
    // Verificar que es profesor
    const user = await User.findOne({
      where: { id: decoded.userId },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
    
    if (!user || user.roleData.role_name !== 'teacher') {
      return res.status(403).json({ error: 'Solo los profesores pueden crear asignaturas' });
    }
    
    // Verificar que no existe una asignatura con el mismo nombre
    const existingSubject = await Subject.findOne({
      where: { subject_name: name }
    });
    
    if (existingSubject) {
      return res.status(409).json({ error: 'Ya existe una asignatura con este nombre' });
    }
    
    // Crear la asignatura
    const newSubject = await Subject.create({
      subject_name: name
    });
    
    // Crear una relación "dummy" para marcar que el profesor da esta asignatura
    await StudentsTeachersRelation.create({
      id_student: decoded.userId, // Usar el mismo ID para marcar como relación de profesor
      id_teacher: decoded.userId,
      id_subject: newSubject.id
    });
    
    console.log(`✅ Profesor ${decoded.userId} creó asignatura: ${name}`);
    
    res.json({ 
      message: 'Asignatura creada exitosamente',
      subject: newSubject
    });
  } catch (error) {
    console.error('Error creando asignatura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//  ACTUALIZAR UNA ASIGNATURA (profesor)
app.put('/api/subjects/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const subjectId = req.params.id;
    const { name } = req.body;
    
    // Verificar que es profesor
    const user = await User.findOne({
      where: { id: decoded.userId },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
    
    if (!user || user.roleData.role_name !== 'teacher') {
      return res.status(403).json({ error: 'Solo los profesores pueden editar asignaturas' });
    }
    
    // Verificar que el profesor da esta asignatura
    const teacherRelation = await StudentsTeachersRelation.findOne({
      where: { 
        id_teacher: decoded.userId,
        id_subject: subjectId
      }
    });
    
    if (!teacherRelation) {
      return res.status(403).json({ error: 'No tienes permisos para editar esta asignatura' });
    }
    
    // Verificar que no existe otra asignatura con el mismo nombre
    const existingSubject = await Subject.findOne({
      where: { 
        subject_name: name,
        id: { [require('sequelize').Op.ne]: subjectId } // Excluir la asignatura actual
      }
    });
    
    if (existingSubject) {
      return res.status(409).json({ error: 'Ya existe otra asignatura con este nombre' });
    }
    
    // Actualizar la asignatura
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }
    
    subject.subject_name = name;
    await subject.save();
    
    console.log(`✅ Profesor ${decoded.userId} actualizó asignatura ${subjectId}: ${name}`);
    
    res.json({ 
      message: 'Asignatura actualizada exitosamente',
      subject: subject
    });
  } catch (error) {
    console.error('Error actualizando asignatura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//  ELIMINAR UNA ASIGNATURA (profesor)
app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const subjectId = req.params.id;
    
    // Verificar que es profesor
    const user = await User.findOne({
      where: { id: decoded.userId },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
    
    if (!user || user.roleData.role_name !== 'teacher') {
      return res.status(403).json({ error: 'Solo los profesores pueden eliminar asignaturas' });
    }
    
    // Verificar que el profesor da esta asignatura
    const teacherRelation = await StudentsTeachersRelation.findOne({
      where: { 
        id_teacher: decoded.userId,
        id_subject: subjectId
      }
    });
    
    if (!teacherRelation) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta asignatura' });
    }
    
    // Eliminar todas las relaciones de la asignatura
    await StudentsTeachersRelation.destroy({
      where: { id_subject: subjectId }
    });
    
    // Eliminar la asignatura
    const deletedRows = await Subject.destroy({
      where: { id: subjectId }
    });
    
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }
    
    console.log(`✅ Profesor ${decoded.userId} eliminó asignatura ${subjectId}`);
    
    res.json({ message: 'Asignatura eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando asignatura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER TODAS LAS ASIGNATURAS CON INFORMACIÓN DE PROFESORES (para estudiantes)
app.get('/api/subjects/all-with-teachers', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener todas las asignaturas
    const allSubjects = await Subject.findAll({
      order: [['subject_name', 'ASC']]
    });
    
    // Para cada asignatura, obtener los profesores que la dan
    const subjectsWithTeachers = await Promise.all(
      allSubjects.map(async (subject) => {
        // Buscar profesores únicos que dan esta asignatura
        const relations = await StudentsTeachersRelation.findAll({
          where: { id_subject: subject.id },
          include: [{
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'surnames'],
            include: [{
              model: Role,
              as: 'roleData',
              where: { role_name: 'teacher' }
            }]
          }]
        });
        
        // Agrupar por profesor y contar estudiantes (excluyendo relaciones dummy)
        const teacherCounts = {};
        relations.forEach(relation => {
          // Solo contar si no es una relación dummy (donde id_student = id_teacher)
          if (relation.id_student !== relation.id_teacher) {
            const teacherId = relation.teacher.id;
            if (teacherCounts[teacherId]) {
              teacherCounts[teacherId].studentCount++;
            } else {
              teacherCounts[teacherId] = {
                id: relation.teacher.id,
                name: relation.teacher.name,
                surnames: relation.teacher.surnames,
                studentCount: 1
              };
            }
          } else {
            // Es una relación dummy, añadir el profesor con 0 estudiantes si no existe
            const teacherId = relation.teacher.id;
            if (!teacherCounts[teacherId]) {
              teacherCounts[teacherId] = {
                id: relation.teacher.id,
                name: relation.teacher.name,
                surnames: relation.teacher.surnames,
                studentCount: 0
              };
            }
          }
        });
        
        const teachers = Object.values(teacherCounts);
        
        return {
          id: subject.id,
          subject_name: subject.subject_name,
          teachers: teachers,
          hasTeachers: teachers.length > 0
        };
      })
    );
    
    res.json(subjectsWithTeachers);
  } catch (error) {
    console.error('Error obteniendo asignaturas con profesores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// UNIRSE COMO PROFESOR A UNA ASIGNATURA EXISTENTE
app.post('/api/teacher/join-subject', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { subjectId } = req.body;
    
    // Verificar que es profesor
    const user = await User.findOne({
      where: { id: decoded.userId },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
    
    if (!user || user.roleData.role_name !== 'teacher') {
      return res.status(403).json({ error: 'Solo los profesores pueden unirse a asignaturas' });
    }
    
    // Verificar que la asignatura existe
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }
    
    // Verificar que el profesor no esté ya dando esta asignatura
    const existingRelation = await StudentsTeachersRelation.findOne({
      where: { 
        id_teacher: decoded.userId,
        id_subject: subjectId 
      }
    });
    
    if (existingRelation) {
      return res.status(409).json({ error: 'Ya estás dando esta asignatura' });
    }
    
    // Crear una relación "dummy" para marcar que el profesor da esta asignatura
    // Usaremos id_student = id_teacher para indicar que es una relación de profesor sin estudiantes
    await StudentsTeachersRelation.create({
      id_student: decoded.userId, // Usar el mismo ID para marcar como relación de profesor
      id_teacher: decoded.userId,
      id_subject: subjectId
    });
    
    console.log(`✅ Profesor ${decoded.userId} se unió a asignatura ${subjectId}`);
    
    res.json({ 
      message: 'Te has unido exitosamente a la asignatura',
      subject: subject.subject_name
    });
  } catch (error) {
    console.error('Error uniéndose a asignatura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// ACTUALIZAR ENDPOINT EXISTENTE DE ASIGNATURAS DEL PROFESOR
app.get('/api/teacher/subjects', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener todas las relaciones del profesor
    const relations = await StudentsTeachersRelation.findAll({
      where: { id_teacher: decoded.userId },
      include: [{
        model: Subject,
        as: 'subject'
      }]
    });
    
    // Agrupar por asignatura y contar estudiantes (excluyendo relaciones dummy)
    const subjectCounts = {};
    relations.forEach(relation => {
      const subjectId = relation.subject.id;
      const subjectName = relation.subject.subject_name;
      
      if (subjectCounts[subjectId]) {
        // Solo contar si no es una relación dummy
        if (relation.id_student !== relation.id_teacher) {
          subjectCounts[subjectId].studentCount++;
        }
      } else {
        subjectCounts[subjectId] = {
          id: subjectId,
          subject_name: subjectName,
          studentCount: relation.id_student !== relation.id_teacher ? 1 : 0
        };
      }
    });
    
    const teacherSubjects = Object.values(subjectCounts);
    
    res.json(teacherSubjects);
  } catch (error) {
    console.error('Error obteniendo asignaturas del profesor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER ESTUDIANTES ASIGNADOS A UNA ASIGNATURA (profesor)
app.get('/api/teacher/subject/:subjectId/students', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const subjectId = req.params.subjectId;
    
    // Verificar que es profesor
    const user = await User.findOne({
      where: { id: decoded.userId },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
    
    if (!user || user.roleData.role_name !== 'teacher') {
      return res.status(403).json({ error: 'Solo los profesores pueden ver estudiantes asignados' });
    }
    
    // Verificar que el profesor imparte esta asignatura
    const teacherRelation = await StudentsTeachersRelation.findOne({
      where: { 
        id_teacher: decoded.userId,
        id_subject: subjectId
      }
    });
    
    if (!teacherRelation) {
      return res.status(403).json({ error: 'No tienes permisos para ver estudiantes de esta asignatura' });
    }
    
    // Obtener estudiantes asignados (excluyendo relaciones dummy)
    const relations = await StudentsTeachersRelation.findAll({
      where: { 
        id_subject: subjectId,
        id_student: { [require('sequelize').Op.ne]: sequelize.col('id_teacher') }
      },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'surnames', 'email', 'avatar']
      }]
    });
    
    const students = relations.map(relation => ({
      id: relation.student.id,
      name: relation.student.name,
      surnames: relation.student.surnames,
      email: relation.student.email,
      avatar: relation.student.avatar ? `http://localhost:${PORT}/uploads/avatars/${relation.student.avatar}` : null
    }));
    
    res.json(students);
  } catch (error) {
    console.error('Error obteniendo estudiantes asignados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER ESTUDIANTES DISPONIBLES PARA ASIGNAR (profesor) - VERSIÓN CORREGIDA
app.get('/api/teacher/subject/:subjectId/available-students', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const subjectId = req.params.subjectId;
    
    // Verificar que es profesor
    const user = await User.findOne({
      where: { id: decoded.userId },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
    
    if (!user || user.roleData.role_name !== 'teacher') {
      return res.status(403).json({ error: 'Solo los profesores pueden ver estudiantes disponibles' });
    }
    
    // Verificar que el profesor imparte esta asignatura
    const teacherRelation = await StudentsTeachersRelation.findOne({
      where: { 
        id_teacher: decoded.userId,
        id_subject: subjectId
      }
    });
    
    if (!teacherRelation) {
      return res.status(403).json({ error: 'No tienes permisos para gestionar esta asignatura' });
    }
    
    // Obtener IDs de estudiantes ya asignados a esta asignatura
    const assignedRelations = await StudentsTeachersRelation.findAll({
      where: { 
        id_subject: subjectId,
        id_student: { [require('sequelize').Op.ne]: sequelize.col('id_teacher') }
      },
      attributes: ['id_student']
    });
    
    const assignedStudentIds = assignedRelations.map(r => r.id_student);
    
    // Construir la consulta para estudiantes disponibles
    let whereClause = {
      role: 1 // Solo estudiantes
    };
    
    // Solo agregar la condición NOT IN si hay estudiantes asignados
    if (assignedStudentIds.length > 0) {
      whereClause.id = { [require('sequelize').Op.notIn]: assignedStudentIds };
    }
    
    // Obtener todos los estudiantes que NO están asignados a esta asignatura
    const availableStudents = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'surnames', 'email', 'avatar'],
      order: [['name', 'ASC'], ['surnames', 'ASC']]
    });
    
    const students = availableStudents.map(student => ({
      id: student.id,
      name: student.name,
      surnames: student.surnames,
      email: student.email,
      avatar: student.avatar ? `http://localhost:${PORT}/uploads/avatars/${student.avatar}` : null
    }));
    
    console.log(`✅ Estudiantes disponibles para asignatura ${subjectId}: ${students.length}`);
    
    res.json(students);
  } catch (error) {
    console.error('Error obteniendo estudiantes disponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ASIGNAR ESTUDIANTE A ASIGNATURA (profesor)
app.post('/api/teacher/assign-student', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { studentId, subjectId } = req.body;
    
    // Verificar que es profesor
    const user = await User.findOne({
      where: { id: decoded.userId },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
    
    if (!user || user.roleData.role_name !== 'teacher') {
      return res.status(403).json({ error: 'Solo los profesores pueden asignar estudiantes' });
    }
    
    // Verificar que el profesor imparte esta asignatura
    const teacherRelation = await StudentsTeachersRelation.findOne({
      where: { 
        id_teacher: decoded.userId,
        id_subject: subjectId
      }
    });
    
    if (!teacherRelation) {
      return res.status(403).json({ error: 'No tienes permisos para asignar estudiantes a esta asignatura' });
    }
    
    // Verificar que el estudiante existe y es estudiante
    const student = await User.findOne({
      where: { 
        id: studentId,
        role: 1 // Solo estudiantes
      }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    // Verificar que el estudiante no esté ya asignado
    const existingRelation = await StudentsTeachersRelation.findOne({
      where: {
        id_student: studentId,
        id_subject: subjectId
      }
    });
    
    if (existingRelation) {
      return res.status(409).json({ error: 'El estudiante ya está asignado a esta asignatura' });
    }
    
    // Crear la relación
    await StudentsTeachersRelation.create({
      id_student: studentId,
      id_teacher: decoded.userId,
      id_subject: subjectId
    });
    
    console.log(`✅ Estudiante ${studentId} asignado a asignatura ${subjectId} por profesor ${decoded.userId}`);
    
    res.json({ 
      message: 'Estudiante asignado exitosamente',
      student: student.name + ' ' + student.surnames
    });
  } catch (error) {
    console.error('Error asignando estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DESASIGNAR ESTUDIANTE DE ASIGNATURA (profesor)
app.post('/api/teacher/remove-student', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { studentId, subjectId } = req.body;
    
    // Verificar que es profesor
    const user = await User.findOne({
      where: { id: decoded.userId },
      include: [{
        model: Role,
        as: 'roleData'
      }]
    });
    
    if (!user || user.roleData.role_name !== 'teacher') {
      return res.status(403).json({ error: 'Solo los profesores pueden desasignar estudiantes' });
    }
    
    // Verificar que el profesor imparte esta asignatura
    const teacherRelation = await StudentsTeachersRelation.findOne({
      where: { 
        id_teacher: decoded.userId,
        id_subject: subjectId
      }
    });
    
    if (!teacherRelation) {
      return res.status(403).json({ error: 'No tienes permisos para desasignar estudiantes de esta asignatura' });
    }
    
    // Eliminar la relación
    const deletedRows = await StudentsTeachersRelation.destroy({
      where: {
        id_student: studentId,
        id_subject: subjectId,
        id_teacher: decoded.userId
      }
    });
    
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Relación no encontrada' });
    }
    
    console.log(`✅ Estudiante ${studentId} desasignado de asignatura ${subjectId} por profesor ${decoded.userId}`);
    
    res.json({ message: 'Estudiante desasignado exitosamente' });
  } catch (error) {
    console.error('Error desasignando estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ACTUALIZAR ENDPOINT DE ASIGNATURAS DETALLADAS DEL PROFESOR
app.get('/api/teacher/subjects-detailed', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener todas las relaciones del profesor
    const relations = await StudentsTeachersRelation.findAll({
      where: { id_teacher: decoded.userId },
      include: [
        {
          model: Subject,
          as: 'subject'
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'surnames', 'email', 'avatar']
        }
      ]
    });
    
    // Agrupar por asignatura
    const subjectsMap = {};
    
    relations.forEach(relation => {
      const subjectId = relation.subject.id;
      const subjectName = relation.subject.subject_name;
      
      if (!subjectsMap[subjectId]) {
        subjectsMap[subjectId] = {
          id: subjectId,
          subject_name: subjectName,
          students: []
        };
      }
      
      // Solo agregar si no es una relación dummy
      if (relation.id_student !== relation.id_teacher) {
        subjectsMap[subjectId].students.push({
          id: relation.student.id,
          name: relation.student.name,
          surnames: relation.student.surnames,
          email: relation.student.email,
          avatar: relation.student.avatar ? `http://localhost:${PORT}/uploads/avatars/${relation.student.avatar}` : null
        });
      }
    });
    
    const detailedSubjects = Object.values(subjectsMap);
    
    res.json(detailedSubjects);
  } catch (error) {
    console.error('Error obteniendo asignaturas detalladas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔐 Cifrado de contraseñas: ACTIVADO (bcrypt con ${SALT_ROUNDS} rounds)`);
});

// === INTEGRACIÓN WEBSOCKET CHAT ===
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const clients = new Map();
wss.on('connection', (ws, req) => {
  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }
    if (data.from && !ws.userId) {
      ws.userId = data.from;
      clients.set(ws.userId, ws);
    }
    if (data.to && data.text) {
      const dest = clients.get(data.to);
      if (dest && dest.readyState === WebSocket.OPEN) {
        dest.send(JSON.stringify(data));
      }
    }
  });
  ws.on('close', () => {
    if (ws.userId) clients.delete(ws.userId);
  });
});
console.log('WebSocket chat server integrado en el mismo proceso Express.');