import express from 'express'; import cors from 'cors'; import dotenv from 'dotenv'; import authRoutes from './routes/auth'; import chatRoutes from './routes/chat';
dotenv.config(); const app = express(); app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' })); app.use(express.json());
app.use('/auth', authRoutes); app.use('/chat', chatRoutes);
const PORT = process.env.PORT || 4000; app.listen(PORT, () => console.log(`Backend on port ${PORT}`));
