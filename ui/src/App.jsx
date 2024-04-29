import { useState, useEffect } from 'react';

const baseApi = 'http://localhost:3000/api';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [fields, setFileds] = useState({
    email: 'nguyenvana@gmail.com',
    password: '123456@',
  });

  const setFiledValue = ({ target: { name, value } }) => {
    setFileds((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    fetch(`${baseApi}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(fields),
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw res;
      })
      .then(({ token }) => {
        localStorage.setItem('token', token);
      })
      .catch((error) => {
        if (error.status === 401) {
          return setError('Email or password is incorrect!');
        }
        setError('Unknow error!');
      });
  };

  useEffect(() => {
    fetch(`${baseApi}/auth/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((me) => setUser(me))
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div>
      {user ? (
        <p>Hello, {user.name}</p>
      ) : (
        <>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <br />
            <input
              type="email"
              name="email"
              id="email"
              value={fields.email}
              onChange={setFiledValue}
            />
            <br />
            <label htmlFor="password">Password</label>
            <br />
            <input
              type="password"
              name="password"
              id="password"
              value={fields.password}
              onChange={setFiledValue}
            />
            <br />
            <button>Login</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;
