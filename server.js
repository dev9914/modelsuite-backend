import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Rotues 
import modelRoutes from './routes/modelRoutes.js';
import agencyRoutes from './routes/agencyRoutes.js';
app.use('/api/v1/model', modelRoutes);
app.use('/api/v1/agency', agencyRoutes);


app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
