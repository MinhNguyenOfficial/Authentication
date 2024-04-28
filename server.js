const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());

const db = {
  users: [
    {
      id: 1,
      email: 'nguyenvana@gmail.com',
      password: '123456@',
      name: 'Nguyen Van A',
    },
  ],
};

const sessions = {};

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    const sessionId = Date.now().toString();
    sessions[sessionId] = { userId: user.id };

    res
      .setHeader('Set-Cookie', `sessionId=${sessionId}; max-age=3600; httpOnly`)
      .redirect('/dashboard');
    return;
  }
  res.send('User not found!');
});

app.get('/dashboard', (req, res) => {
  const session = sessions[req.cookies.sessionId];
  if (!session) {
    return res.redirect('/login');
  }

  const user = db.users.find((user) => user.id === session.userId);

  if (!user) {
    return res.redirect('/login');
  }
  res.render('pages/dashboard', { user });
});

app.get('/logout', (req, res) => {
  delete sessions[req.cookies.sessionId];
  res.setHeader('Set-Cookie', 'sessionid=', 'max-age=0').redirect('/login');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
