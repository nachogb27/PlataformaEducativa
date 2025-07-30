const userRepository = require('../repositories/user.repository');
const { uploadToS3, deleteFromS3, extractS3Key } = require('../config/aws');

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const profileData = {
      id: user.id,
      name: user.name,
      surnames: user.surnames,
      email: user.email,
      username: user.username,
      role: user.roleData.role_name,
      avatar: user.avatar
    };

    return profileData;
  }

  async updateProfile(userId, profileData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    await userRepository.update(userId, profileData);
    return { message: 'Perfil actualizado exitosamente' };
  }

  async updateAvatar(userId, file) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Eliminar avatar anterior si existe
    if (user.avatar) {
      const oldAvatarKey = extractS3Key(user.avatar);
      if (oldAvatarKey) {
        await deleteFromS3(oldAvatarKey);
      }
    }

    // La URL del nuevo avatar viene en file.location (multer-s3)
    const avatarUrl = file.location;
    await userRepository.update(userId, { avatar: avatarUrl });

    return {
      message: 'Avatar actualizado exitosamente',
      avatarUrl: avatarUrl
    };
  }

  async deleteAvatar(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.avatar) {
      throw new Error('El usuario no tiene avatar');
    }

    // Eliminar de S3
    const avatarKey = extractS3Key(user.avatar);
    if (avatarKey) {
      await deleteFromS3(avatarKey);
    }

    // Eliminar referencia de la base de datos
    await userRepository.update(userId, { avatar: null });

    return { message: 'Avatar eliminado exitosamente' };
  }
}

module.exports = new UserService();