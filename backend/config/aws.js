// config/aws.js - Con metadata corregida
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configurar AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configurar multer para S3
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user ? req.user.id.toString() : 'anonymous', // ✅ Convertir a string
        uploadDate: new Date().toISOString()
      });
    },
    key: function (req, file, cb) {
      const uniqueName = `avatars/${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
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

// Función para eliminar archivo de S3
const deleteFromS3 = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey
    };
    
    await s3.deleteObject(params).promise();
    console.log(`✅ Archivo eliminado de S3: ${fileKey}`);
    return true;
  } catch (error) {
    console.error('❌ Error eliminando archivo de S3:', error);
    return false;
  }
};

// Función para extraer la key del archivo desde la URL completa
const extractS3Key = (s3Url) => {
  if (!s3Url) return null;
  
  try {
    if (s3Url.includes('amazonaws.com')) {
      const url = new URL(s3Url);
      return url.pathname.substring(1);
    }
    
    if (s3Url.startsWith('avatars/')) {
      return s3Url;
    }
    
    return null;
  } catch (error) {
    console.error('Error extrayendo S3 key:', error);
    return null;
  }
};

// Función para verificar si el bucket existe
const checkBucketExists = async () => {
  try {
    await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET_NAME }).promise();
    console.log(`✅ Bucket S3 verificado: ${process.env.AWS_S3_BUCKET_NAME}`);
    return true;
  } catch (error) {
    console.error(`❌ Error verificando bucket S3: ${error.message}`);
    return false;
  }
};

// Función para generar URLs firmadas (signed URLs) para acceso temporal
const getSignedUrl = (fileKey, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Expires: expiresIn // segundos
    };
    
    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Error generando URL firmada:', error);
    return null;
  }
};

module.exports = {
  s3,
  uploadToS3,
  deleteFromS3,
  extractS3Key,
  checkBucketExists,
  getSignedUrl
};