// src/components/OnScreenControls.js
import React from 'react';
import Draggable from 'react-draggable';

const buttonStyle = {
    background: 'rgba(255,255,255,0.3)',
    border: '2px solid rgba(0,0,0,0.5)',
    color: 'black',
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '5px'
};

const OnScreenControls = ({ onMove }) => {
    // Default positions, user can drag them around
    // Positions are relative to the nearest positioned ancestor (likely the App container)
    return (
        <>
            <Draggable defaultPosition={{x: 70, y: window.innerHeight - 180}}>
                <button style={buttonStyle} onClick={() => onMove(0, -1)} title="Up">↑</button>
            </Draggable>
            <Draggable defaultPosition={{x: 70, y: window.innerHeight - 80}}>
                <button style={buttonStyle} onClick={() => onMove(0, 1)} title="Down">↓</button>
            </Draggable>
            <Draggable defaultPosition={{x: 10, y: window.innerHeight - 130}}>
                <button style={buttonStyle} onClick={() => onMove(-1, 0)} title="Left">←</button>
            </Draggable>
            <Draggable defaultPosition={{x: 130, y: window.innerHeight - 130}}>
                <button style={buttonStyle} onClick={() => onMove(1, 0)} title="Right">→</button>
            </Draggable>
        </>
    );
};

export default OnScreenControls;