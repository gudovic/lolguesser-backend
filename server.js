const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const championRoutes = require('./routes/champion');
const guessRoutes = require('./routes/guess');
const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const profileRoute = require('./routes/profile');
const logoutRoute = require('./routes/logout');
const statsRoute = require('./routes/stats');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5500', 'https://lolguesser.netlify.app', 'https://lolgiss.com', 'https://www.lolgiss.com', 'https://api.lolgiss.com'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/stats', statsRoute);
app.use('/api/champion', championRoutes);
app.use('/api/guess', guessRoutes);
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/profile', profileRoute);
app.use('/api/logout', logoutRoute);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  })
  .finally(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  });
