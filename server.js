const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const championRoutes = require('./routes/champion');

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/champion', championRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
