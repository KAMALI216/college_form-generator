const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const ocrRoutes = require('./routes/ocr');
const templateRoutes = require('./routes/templateRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const userAuthRoutes = require('./routes/userAuth');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/user', userAuthRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/submissions', submissionRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;