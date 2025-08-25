require('dotenv').config();

console.log('🔍 Diagnóstico de configuración AWS S3\n');

console.log('📁 1. Verificando archivo .env:');
console.log(`   Ruta del proyecto: ${process.cwd()}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'no definido'}`);

console.log('\n🔧 2. Variables de entorno AWS:');
const awsVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY', 
  'AWS_REGION',
  'AWS_S3_BUCKET_NAME'
];

awsVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('KEY') || varName.includes('SECRET')) {
      console.log(`   ${varName}: ${'*'.repeat(Math.min(value.length, 20))}`);
    } else {
      console.log(`   ${varName}: ${value}`);
    }
  } else {
    console.log(`   ${varName}: ❌ NO DEFINIDO`);
  }
});

console.log('\n📄 3. Verificando archivo .env:');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    console.log(`   Archivo encontrado: ${envPath}`);
    console.log(`   Líneas en el archivo: ${lines.length}`);
    
    const awsLines = lines.filter(line => 
      line.trim().startsWith('AWS_') && !line.trim().startsWith('#')
    );
    
    console.log('   Líneas AWS encontradas:');
    awsLines.forEach((line, index) => {
      const [key] = line.split('=');
      console.log(`     ${index + 1}. ${key}=...`);
    });
    
    const commentedAws = lines.filter(line => 
      line.trim().startsWith('#') && line.includes('AWS_')
    );
    
    if (commentedAws.length > 0) {
      console.log('   ⚠️  Líneas AWS comentadas encontradas:');
      commentedAws.forEach(line => {
        console.log(`     ${line.trim()}`);
      });
    }
    
  } else {
    console.log(`   ❌ Archivo .env no encontrado en: ${envPath}`);
  }
} catch (error) {
  console.log(`   ❌ Error leyendo .env: ${error.message}`);
}

console.log('\n⚙️  4. Probando configuración AWS:');
try {
  console.log('   Intentando importar config/aws.js...');
  
  if (!process.env.AWS_S3_BUCKET_NAME) {
    console.log('   ❌ AWS_S3_BUCKET_NAME no está definido - esto causará el error');
    console.log('   💡 Solución: Define AWS_S3_BUCKET_NAME en tu archivo .env');
  } else {
    console.log(`   ✅ AWS_S3_BUCKET_NAME definido: ${process.env.AWS_S3_BUCKET_NAME}`);
    
    const awsConfig = require('../config/aws');
    console.log('   ✅ Configuración AWS importada correctamente');
  }
  
} catch (error) {
  console.log(`   ❌ Error importando config/aws.js: ${error.message}`);
  console.log(`   Stack: ${error.stack}`);
}

console.log('\n📝 5. Ejemplo de archivo .env requerido:');
console.log(`
# Archivo .env (debe estar en la raíz del backend)
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=tu-bucket-name

# Otras variables que puedas tener
DATABASE_URL=...
JWT_SECRET=...
`);

console.log('\n🔧 Pasos para solucionar:');
console.log('1. Asegúrate de que el archivo .env esté en la raíz del backend');
console.log('2. Verifica que AWS_S3_BUCKET_NAME esté definido y sin comentar');
console.log('3. Reinicia el proceso después de modificar .env');
console.log('4. Ejecuta: node scripts/test-s3.js');