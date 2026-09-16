import React from 'react';

function Navbar({ subtitle }) {
  return (
    <header className="auth-brand">
      <h1>COLLEGE FORM GENERATOR</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}

export default Navbar;
