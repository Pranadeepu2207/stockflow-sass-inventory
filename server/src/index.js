const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');

// load env file first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// enable cors so the react dev server can talk to us
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// parse json payloads in request bodies
app.use(express.json());

// api routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// if frontend is built into client/dist, serve it directly
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    // don't intercept api calls with html file
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// catch-all for unknown api endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Requested API endpoint does not exist' });
});

// generic error handler so requests don't hang
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'An unexpected server error occurred' });
});

// start http listener immediately so vite proxy never fails, then connect db
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`[StockFlow Server] Running on http://localhost:${PORT}`);
    connectDB();
  });
};

startServer();
