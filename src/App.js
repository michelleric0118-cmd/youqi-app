import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Items from './pages/Items';
import AddItem from './pages/AddItem';
import Expiring from './pages/Expiring';
import FirebaseTest from './components/FirebaseTest';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/expiring" element={<Expiring />} />
          <Route path="/firebase-test" element={<FirebaseTest />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
