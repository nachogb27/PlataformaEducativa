const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const sessionRepository = require('../repositories/session.repository');
const emailService = require('./email.service');
const { validateEmail, validatePassword } = require('../utils/validation');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.SALT_ROUNDS = 12;
    this.TEACHER_TOKEN = process.env.TEACHER_TOKEN;
  }

  async login(credentials) {
    const { username, password } = credentials;

    // Buscar usuario
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Credenciales incorrectas');
    }

    // Verificar cuenta activada
    if (user.active === 0) {
      throw new Error('La cuenta no está activada');
    }

    // Validar contraseña
    const isPasswordValid = bcrypt.compareSync(password, user.password_token);
    if (!isPasswordValid) {
      throw new Error('Credenciales incorrectas');
    }

    // Crear sesión
    await sessionRepository.create(user.id);

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, role: user.roleData.role_name },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        surnames: user.surnames,
        email: user.email,
        role: user.roleData.role_name
      }
    };
  }

  async register(userData) {
    const { name, surnames, username, email, password, confirmPassword, role, teacherToken } = userData;

    // Validaciones
    if (password !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (!validateEmail(email)) {
      throw new Error('Email inválido');
    }

    if (!validatePassword(password)) {
      throw new Error('La contraseña no cumple los requisitos mínimos');
    }

    // Verificar username único
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Verificar email único
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('El email ya está registrado');
    }

    // Verificar token de profesor
    const roleId = role === 'teacher' ? 2 : 1;
    if (roleId === 2) {
      if (!teacherToken || teacherToken !== this.TEACHER_TOKEN) {
        throw new Error('Token de profesor inválido');
      }
    }

    // Cifrar contraseña
    const hashedPassword = bcrypt.hashSync(password, this.SALT_ROUNDS);

    // Crear usuario
    const newUser = await userRepository.create({
      name,
      surnames,
      username,
      email,
      role: roleId,
      password_token: hashedPassword,
      access_token: uuidv4(),
      active: 0
    });

    // Enviar email de activación
    await emailService.sendActivationEmail(email, name, newUser.access_token);

    return {
      message: 'Usuario registrado exitosamente. Revisa tu email para activar la cuenta.',
      userId: newUser.id
    };
  }

  async activateAccount(token) {
    const user = await userRepository.findByAccessToken(token);
    
    if (!user || user.active === 1) {
      throw new Error('Token inválido o cuenta ya activada');
    }

    await userRepository.update(user.id, { active: 1 });
    
    return { message: 'Cuenta activada exitosamente' };
  }

  async forgotPassword(email) {
    if (!validateEmail(email)) {
      throw new Error('Email inválido');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('No existe un usuario con este email');
    }

    if (user.active === 0) {
      throw new Error('La cuenta no está activada');
    }

    // Generar token de reset
    const resetToken = uuidv4();
    await userRepository.update(user.id, { password_token: resetToken });

    // Enviar email
    await emailService.sendPasswordResetEmail(email, user.name, resetToken);

    return { message: 'Email de recuperación enviado exitosamente' };
  }

  async resetPassword(token, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (!validatePassword(newPassword)) {
      throw new Error('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número');
    }

    const user = await userRepository.findByPasswordToken(token);
    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Cifrar nueva contraseña
    const hashedPassword = bcrypt.hashSync(newPassword, this.SALT_ROUNDS);
    await userRepository.update(user.id, { password_token: hashedPassword });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async logout(userId) {
    await sessionRepository.closeSession(userId);
    return { message: 'Sesión cerrada exitosamente' };
  }
}

module.exports = new AuthService();