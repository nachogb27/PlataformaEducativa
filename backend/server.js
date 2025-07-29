require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const { checkBucketExists } = require('./config/aws');


const { sequelize } = require('./models/index');

// Importar rutas
const routes = require('./routes');

// Configurar Express
const app = express();
const PORT = 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// DEBUG: Log de todas las requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Configuración de MongoDB para el chat
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('🍃 Conectado a MongoDB para el chat');
}).catch(error => {
  console.error('❌ Error conectando a MongoDB:', error);
});

// Verificar AWS S3 al iniciar
(async () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET_NAME) {
    const bucketExists = await checkBucketExists();
    if (bucketExists) {
      console.log('🪣 AWS S3 configurado correctamente');
    } else {
      console.error('❌ Error: Bucket S3 no accesible');
    }
  } else {
    console.warn('⚠️ AWS S3 no configurado - se usará almacenamiento local');
  }
})();

// DEBUG: Verificar que las rutas se cargan correctamente
console.log('🔗 Cargando rutas...');

// Usar todas las rutas con prefijo /api
app.use('/api', routes);

const authRoutes = require('./routes/auth.routes');
app.use('/api', authRoutes);


// Ruta de prueba simple para auth
app.post('/api/auth/test', (req, res) => {
  console.log('🧪 Test route hit');
  res.json({ message: 'Test route working', body: req.body });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  
  // Errores de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: error.errors.map(err => err.message)
    });
  }
  
  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }
  
  // Error genérico
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Ha ocurrido un error'
  });
});

// Catch-all para rutas no encontradas
app.use('*', (req, res) => {
  console.log('❌ Ruta no encontrada:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
});

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      mysql: 'connected',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      s3: process.env.AWS_S3_BUCKET_NAME ? 'configured' : 'not configured'
    }
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔐 Cifrado de contraseñas: ACTIVADO (bcrypt)`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// === INTEGRACIÓN WEBSOCKET CHAT SIN GUARDADO AUTOMÁTICO ===
const wss = new WebSocket.Server({ server });
const clients = new Map(); // userId -> websocket

// Manejar conexiones WebSocket
wss.on('connection', (ws, req) => {
  console.log('🔗 Nueva conexión WebSocket');

  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log('📨 Mensaje WebSocket recibido:', data);

      // Registro de usuario
      if (data.type === 'register' && data.userId && !ws.userId) {
        ws.userId = data.userId;
        clients.set(data.userId, ws);
        
        console.log(`✅ Usuario ${data.userId} registrado en WebSocket`);
        
        // Enviar confirmación
        ws.send(JSON.stringify({
          type: 'registered',
          userId: data.userId,
          timestamp: new Date()
        }));
        
        // Enviar lista de usuarios online
        const onlineUsers = Array.from(clients.keys());
        clients.forEach((clientWs) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'users_online',
              users: onlineUsers
            }));
          }
        });
        return;
      }

      // 🔧 FIX: Envío de mensaje MEJORADO
      if (data.type === 'message' && data.from && data.to && data.text) {
        const timestamp = new Date();
        const messageId = data.messageId || `msg_${data.from}_${data.to}_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Preparar mensaje para envío WebSocket
        const wsMessage = {
          type: 'message',
          from: data.from,
          to: data.to,
          text: data.text,
          timestamp: timestamp,
          messageId: messageId
        };

        // 🔧 FIX: Enviar PRIMERO al remitente (confirmación)
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            ...wsMessage,
            type: 'message_sent' // Confirmación para el remitente
          }));
        }

        // 🔧 FIX: Enviar DESPUÉS al destinatario
        const recipientWs = clients.get(data.to);
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN && recipientWs !== ws) {
          recipientWs.send(JSON.stringify(wsMessage));
          console.log(`📤 Mensaje enviado en tiempo real a usuario ${data.to}`);
        } else {
          console.log(`📴 Usuario ${data.to} no está conectado`);
        }

        console.log(`💬 Mensaje en tiempo real: ${data.from} -> ${data.to}`);
      }

      // Solicitud de historial (desde MongoDB)
      if (data.type === 'get_history' && data.with && ws.userId) {
        try {
          const { Message } = require('./models/chat.model');
          const messages = await Message.find({
            $or: [
              { 'sender.userId': ws.userId, 'receiver.userId': data.with },
              { 'sender.userId': data.with, 'receiver.userId': ws.userId }
            ]
          }).sort({ timestamp: 1 }).limit(100);

          ws.send(JSON.stringify({
            type: 'history',
            messages: messages.map(msg => ({
              from: msg.sender.userId,
              to: msg.receiver.userId,
              text: msg.content,
              timestamp: msg.timestamp,
              messageId: msg._id.toString(),
              senderName: msg.sender.name,
              receiverName: msg.receiver.name
            })),
            with: data.with
          }));
          
          console.log(`📜 Historial enviado: ${messages.length} mensajes guardados`);
        } catch (error) {
          console.error('Error obteniendo historial:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error obteniendo historial'
          }));
        }
      }

    } catch (error) {
      console.error('Error procesando mensaje WebSocket:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error procesando mensaje'
      }));
    }
  });

  // Manejar desconexión
  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`👋 Usuario ${ws.userId} desconectado del WebSocket`);
      
      // Notificar a otros usuarios que este usuario se desconectó
      const onlineUsers = Array.from(clients.keys());
      clients.forEach((clientWs) => {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: 'users_online',
            users: onlineUsers
          }));
        }
      });
    }
  });

  // Manejar errores
  ws.on('error', (error) => {
    console.error('❌ Error en WebSocket:', error);
    if (ws.userId) {
      clients.delete(ws.userId);
    }
  });
});

console.log('🔄 WebSocket chat en tiempo real iniciado (sin guardado automático).');