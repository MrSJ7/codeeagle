import React, { useState } from 'react';
import { authenticateUser } from '../auth.js';

export function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('<b>Welcome to the portal</b>');

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = authenticateUser(username, password);
    if (token && onLogin) onLogin(token);
  };

  return (
    <div className="login-container">
      <div dangerouslySetInnerHTML={{ __html: notice }} />
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
