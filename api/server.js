const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const cookiePaser = require('cookie-parser');
const { base64url } = require('./helpers');
const app = express();
const port = 3000;
const jwtSecret =
  'NeH0OXbCJUO3cJnreKZvNKM618fpiFt4G4DsDZOnq3VVXO4eMZTx6DzlX0PtlHyrgE9ULt6YWq3kjqqu5d2udzE0kvNLAtkwxp+XY1JTa/MmTDB0AeeNxd5vbqiV7IMUluSGV92LHDUsGgVRQt5Mos/W62yqgOX7RPpxLQ6F3iFynxi/FyPXJ8F9qxDZ3/APMyjjPv04t5XOVwUNZuootj5E1uZNQiLLJvsIalAxwdGkVutdzVpk5WnBVR6/mimALJWfaRCQ6Z9vUNewMvbuwVt9bflDTJKZni+Ytei3/a/eOxDt0AHYQck5crPqkV4H+P+RHqAuIWOz/CW+6eJTNA==';

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

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    sub: user.id,
    exp: Date.now() + 60 * 60 * 1000,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));

  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac('sha256', jwtSecret);
  const signature = hmac.update(tokenData).digest('base64url');

  return res.json({
    token: `${tokenData}.${signature}`,
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization.slice(7);
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  const [encodedHeader, encodedPayload, tokenSignature] = token.split('.');

  const tokenData = `${encodedHeader}.${encodedPayload}`;
  const hmac = crypto.createHmac('sha256', jwtSecret);
  const signature = hmac.update(tokenData).digest('base64url');

  if (tokenSignature !== signature) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  const payload = JSON.parse(atob(encodedPayload));
  const user = db.users.find((user) => user.id === payload.sub);

  if (!user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  if (payload.exp < Date.now()) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  return res.json(user);
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
