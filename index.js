const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const batchRoutes = require('./routes/batchRoutes');
const groupRoutes = require('./routes/groupRoutes');
const mockRoutes = require('./mocks/mockRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/v1/batches', batchRoutes);
app.use('/v1/groups', groupRoutes);

if (process.env.NODE_ENV === 'development') {
  app.use('/mock/v1/groups', mockRoutes);
}

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Module 3 running on port ${PORT}`));
