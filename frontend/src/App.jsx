import React, { useState } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (receivedToken) => {
    setToken(receivedToken);
  };

  return (
    <>
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Home />
      )}
    </>
  );
}

export default App;
