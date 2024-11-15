// src/App.js
import React, { useState } from 'react';
import Home from './Home';
import About from './About';

const App = () => {
    const [currentView, setCurrentView] = useState('home'); // 默认视图

    const renderView = () => {
        switch (currentView) {
            case 'home':
                return <Home />;
            case 'about':
                return <About />;
            default:
                return <Home />;
        }
    };

    return (
        <div>
            <nav>
                <button onClick={() => setCurrentView('home')}>首页</button>
                <button onClick={() => setCurrentView('about')}>关于我们</button>
            </nav>
            {renderView()}
        </div>
    );
};

export default App;