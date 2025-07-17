const bcrypt = require('bcrypt');
const { User, sequelize } = require('./index');

const SALT_ROUNDS = 12;

/**
 * 🔐 SCRIPT DE MIGRACIÓN DE CONTRASEÑAS
 * 
 * PROPÓSITO:
 * - Convierte contraseñas de texto plano a hashes bcrypt
 * - Permite que usuarios existentes sigan funcionando después del cambio
 * 
 * CUÁNDO USARLO:
 * - UNA SOLA VEZ antes de usar el nuevo server.js con bcrypt
 * - Cuando tengas usuarios existentes en la BD
 * 
 * CÓMO USARLO:
 * 1. Guardar este archivo como: backend/migratePasswords.js
 * 2. Ejecutar: node migratePasswords.js
 * 3. Verificar que todo salió bien
 * 4. Usar el nuevo server.js
 */

async function migratePasswordsToBcrypt() {
  try {
    console.log('🔐 INICIANDO MIGRACIÓN DE CONTRASEÑAS...\n');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Obtener todos los usuarios
    const users = await User.findAll({
      attributes: ['id', 'username', 'password_token', 'email']
    });

    console.log(`📊 Usuarios encontrados en la BD: ${users.length}\n`);

    if (users.length === 0) {
      console.log('ℹ️  No hay usuarios para migrar');
      return;
    }

    let migratedCount = 0;
    let alreadyHashedCount = 0;
    let errorCount = 0;

    // Procesar cada usuario
    for (const user of users) {
      try {
        console.log(`🔍 Procesando usuario: ${user.username} (${user.email})`);
        
        // Verificar si la contraseña ya está hasheada
        // Las contraseñas bcrypt siempre empiezan con $2a$, $2b$, $2x$, o $2y$
        const isAlreadyHashed = /^\$2[abxy]\$/.test(user.password_token);
        
        if (isAlreadyHashed) {
          console.log(`   ⏭️  Ya está cifrada, saltando...\n`);
          alreadyHashedCount++;
          continue;
        }

        // La contraseña está en texto plano
        const originalPassword = user.password_token;
        console.log(`   🔓 Contraseña actual: "${originalPassword}" (texto plano)`);
        
        // Cifrar la contraseña
        console.log(`   🔐 Cifrando con bcrypt (${SALT_ROUNDS} rounds)...`);
        const hashedPassword = bcrypt.hashSync(originalPassword, SALT_ROUNDS);
        console.log(`   🔒 Hash generado: ${hashedPassword.substring(0, 20)}...`);
        
        // Actualizar en la base de datos
        await User.update(
          { password_token: hashedPassword },
          { where: { id: user.id } }
        );

        console.log(`   ✅ ¡Migración exitosa!\n`);
        migratedCount++;

      } catch (userError) {
        console.error(`   ❌ Error procesando usuario ${user.username}:`, userError.message);
        errorCount++;
      }
    }

    // Mostrar resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📈 RESUMEN DE MIGRACIÓN:');
    console.log('='.repeat(50));
    console.log(`✅ Usuarios migrados exitosamente: ${migratedCount}`);
    console.log(`⏭️  Usuarios ya cifrados (saltados): ${alreadyHashedCount}`);
    console.log(`❌ Usuarios con errores: ${errorCount}`);
    console.log(`📊 Total procesados: ${users.length}`);
    
    if (migratedCount > 0) {
      console.log('\n🎉 ¡MIGRACIÓN COMPLETADA!');
      console.log('💡 Ahora puedes usar el nuevo server.js con bcrypt');
      console.log('🔑 Los usuarios podrán iniciar sesión con sus contraseñas originales');
    }
    
    if (errorCount > 0) {
      console.log('\n⚠️  Algunos usuarios tuvieron errores. Revisa los logs arriba.');
    }

  } catch (error) {
    console.error('💥 ERROR CRÍTICO en la migración:', error);
    console.log('\n❌ La migración no se completó. Revisa el error y vuelve a intentar.');
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('\n🔌 Conexión a base de datos cerrada');
  }
}

// 🚀 EJECUTAR LA MIGRACIÓN
console.log('🔐 SCRIPT DE MIGRACIÓN DE CONTRASEÑAS');
console.log('=====================================');
console.log('⚠️  IMPORTANTE: Este script debe ejecutarse UNA SOLA VEZ');
console.log('⚠️  IMPORTANTE: Haz backup de tu BD antes de ejecutar');
console.log('');

// Preguntar confirmación (opcional, para mayor seguridad)
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('¿Estás seguro de que quieres migrar las contraseñas? (sí/no): ', (answer) => {
  if (answer.toLowerCase() === 'sí' || answer.toLowerCase() === 'si' || answer.toLowerCase() === 'yes') {
    console.log('\n🚀 Iniciando migración...\n');
    migratePasswordsToBcrypt().then(() => {
      console.log('\n✅ Script completado');
      process.exit(0);
    }).catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
  } else {
    console.log('\n❌ Migración cancelada por el usuario');
    process.exit(0);
  }
  rl.close();
});