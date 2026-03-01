import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { GameApp } from "./GameApp";
import { DrawingApp } from "./DrawingApp";
import { GeneticApp } from "./GeneticApp";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-900 text-white p-6">
        <nav className="mb-6 flex gap-4">
          <Link to="/" className="text-blue-400 hover:underline">游戏模式</Link>
          <Link to="/drawing" className="text-blue-400 hover:underline">绘画示例</Link>
          <Link to="/genetic" className="text-blue-400 hover:underline">遗传算法示例</Link>
        </nav>
        <Routes>
          <Route path="/" element={<GameApp />} />
          <Route path="/drawing" element={<DrawingApp />} />
          <Route path="/genetic" element={<GeneticApp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;