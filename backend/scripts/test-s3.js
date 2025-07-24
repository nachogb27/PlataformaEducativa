// scripts/test-s3.js
require('dotenv').config();
const { checkBucketExists, s3 } = require('../config/aws');

async function testS3Connection() {
  console.log('🧪 Probando conexión con AWS S3...\n');
  
  // Test 1: Variables de entorno
  console.log('📋 1. Verificando variables de entorno:');
  const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET_NAME'];
  
  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName}: configurado`);
    } else {
      console.log(`   ❌ ${varName}: falta`);
      allVarsPresent = false;
    }
  });
  
  if (!allVarsPresent) {
    console.log('\n❌ Faltan variables de entorno. Revisa tu archivo .env');
    return false;
  }
  
  // Test 2: Conexión al bucket
  console.log('\n🪣 2. Verificando acceso al bucket:');
  try {
    const bucketExists = await checkBucketExists();
    if (bucketExists) {
      console.log('   ✅ Bucket accesible correctamente');
    } else {
      console.log('   ❌ No se puede acceder al bucket');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
  
  // Test 3: Permisos básicos
  console.log('\n🔐 3. Verificando permisos:');
  try {
    // Test ListBucket
    await s3.listObjectsV2({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      MaxKeys: 1
    }).promise();
    console.log('   ✅ ListBucket: OK');
    
    // Test GetBucketLocation
    const location = await s3.getBucketLocation({
      Bucket: process.env.AWS_S3_BUCKET_NAME
    }).promise();
    console.log(`   ✅ Región del bucket: ${location.LocationConstraint || 'us-east-1'}`);
    
  } catch (error) {
    console.log(`   ❌ Error de permisos: ${error.message}`);
    return false;
  }
  
  // Test 4: Subida de prueba
  console.log('\n📤 4. Probando subida de archivo:');
  try {
    const testData = Buffer.from('Test file for S3');
    const testKey = `test/test-${Date.now()}.txt`;
    
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: testKey,
      Body: testData,
      ContentType: 'text/plain',
      ACL: 'public-read'
    }).promise();
    
    console.log(`   ✅ Archivo subido: ${uploadResult.Location}`);
    
    // Limpiar archivo de prueba
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: testKey
    }).promise();
    
    console.log('   ✅ Archivo de prueba eliminado');
    
  } catch (error) {
    console.log(`   ❌ Error subiendo archivo: ${error.message}`);
    return false;
  }
  
  console.log('\n🎉 ¡Todas las pruebas pasaron! AWS S3 está configurado correctamente.');
  return true;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testS3Connection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error ejecutando pruebas:', error);
      process.exit(1);
    });
}

module.exports = { testS3Connection };