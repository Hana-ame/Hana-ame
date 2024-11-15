// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import About from './About';
import NumberConverter from './calc/NumberConverter';

const App = () => {
  return (
    <Router>
      <nav className="bg-blue-500 p-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="text-white hover:text-gray-200">首页</Link>
          </li>
          <li>
            <Link to="/about" className="text-white hover:text-gray-200">关于我们</Link>
          </li>
          <li>
            <Link to="/number-converter" className="text-white hover:text-gray-200">NumberConverter</Link>
          </li>
        </ul>
      </nav>

      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/number-converter" element={<NumberConverter />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;