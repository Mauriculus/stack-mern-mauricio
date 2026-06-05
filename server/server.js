// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./mongo');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const classRoutes = require('./routes/classRoute');
const { PORT } = require('./config');
const dns = require('dns');


dns.setServers(['8.8.8.8', '8.8.4.4']);
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/classes', classRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));
