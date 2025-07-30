const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plataforma_educativa';

console.log('🔄 Intentando conectar a:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('🍃 ✅ MongoDB conectado exitosamente');
  console.log('📊 Base de datos:', mongoose.connection.name);
  console.log('🔗 Host:', mongoose.connection.host);
  console.log('📍 Puerto:', mongoose.connection.port);
  mongoose.connection.close();
}).catch(error => {
  console.error('❌ Error conectando a MongoDB:', error.message);
  console.error('💡 Verifica que MongoDB esté corriendo');
});