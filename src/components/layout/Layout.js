import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        {children}
      </main>
    </div>
  );
};

export default Layout; 