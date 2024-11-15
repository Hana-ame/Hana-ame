// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import About from './About';

const App = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">首页</Link>
          </li>
          <li>
            <Link to="/about">关于我们</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;