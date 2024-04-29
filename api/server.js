const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const cookiePaser = require('cookie-parser');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookiePaser());

const db = {
  users: [
    {
      id: 1,
      email: 'nguyenvana@gmail.com',
      password: '123456@',
      name: 'Nguyen Van A',
    },
    {
      id: 2,
      email: 'nguyenvanb@gmail.com',
      password: '123456@',
      name: 'Nguyen Van B',
    },
  ],
  posts: [
    { id: 1, title: 'Title 1', description: 'Description 1' },
    { id: 2, title: 'Title 2', description: 'Description 2' },
    { id: 3, title: 'Title 3', description: 'Description 3' },
  ],
};

const sessions = {};

app.get('/api/posts', (req, res) => {
  return res.json(db.posts);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  const sessionId = Date.now().toString();
  sessions[sessionId] = { sub: user.id };
  return res
    .setHeader(
      'Set-Cookie',
      `sessionId=${sessionId}; HttpOnly; Max-age=3600; SameSite=None; Secure; Partitioned`
    )
    .json(user);
});

app.get('/api/auth/me', (req, res) => {
  const session = sessions[req.cookies.sessionId];
  if (!session) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  const user = db.users.find((user) => user.id === session.sub);
  if (!user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  return res.json(user);
});

https
  .createServer(
    {
      key: fs.readFileSync('testcookie.com+2-key.pem'),
      cert: fs.readFileSync('testcookie.com+2.pem'),
    },
    app
  )
  .listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
