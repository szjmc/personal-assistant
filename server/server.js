const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(express.json({ extended: false }));

// CORS
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 路由
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/exam', require('./routes/exam'));
app.use('/api/words', require('./routes/words'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// 生产环境配置
if (process.env.NODE_ENV === 'production') {
  // 静态资源目录
  app.use(express.static(path.join(__dirname, '../client/build')));

  // 所有非API请求返回index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));
    