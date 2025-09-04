import express from 'express';
import cors from 'cors';
import chatCompletionHandler from './src/handlers/chatCompletion.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 必要的中间件
app.use(cors());
app.use(express.json());

// API路由
app.post('/api/chat/completions', chatCompletionHandler);

// 导出Express应用供Vercel Serverless使用
module.exports = app;
