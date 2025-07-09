const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const championRoutes = require('./routes/champion');
const guessRoutes = require('./routes/guess');

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/champion', championRoutes);
app.use('/api/guess', guessRoutes);


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
