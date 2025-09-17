// src/components/ControlsPanel.js
import React, { useState } from 'react';

const ControlsPanel = ({ settings, onSettingChange, onResetLevel, onShowInstructions }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleColorChange = (key, value) => {
        onSettingChange(key, value);
    };

    if (!settings) return null; // Or some loading indicator

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
            minWidth: '200px'
        }}>
            <button onClick={() => setIsExpanded(!isExpanded)} style={{ marginBottom: '10px', width: '100%' }}>
                {isExpanded ? 'Hide Settings' : 'Show Settings'}
            </button>
            {isExpanded && (
                <>
                    <div>
                        <label>Player Color: </label>
                        <input type="color" value={settings.playerColor} onChange={(e) => handleColorChange('playerColor', e.target.value)} />
                    </div>
                    <div>
                        <label>Box Color: </label>
                        <input type="color" value={settings.boxColor} onChange={(e) => handleColorChange('boxColor', e.target.value)} />
                    </div>
                    <div>
                        <label>Wall Color: </label>
                        <input type="color" value={settings.wallColor} onChange={(e) => handleColorChange('wallColor', e.target.value)} />
                    </div>
                    <div>
                        <label>Target Color: </label>
                        <input type="color" value={settings.targetColor} onChange={(e) => handleColorChange('targetColor', e.target.value)} />
                    </div>
                     <div>
                        <label>Grid Color: </label>
                        <input type="color" value={settings.gridColor} onChange={(e) => handleColorChange('gridColor', e.target.value)} />
                    </div>
                     <div>
                        <label>Background: </label>
                        <input type="color" value={settings.backgroundColor} onChange={(e) => handleColorChange('backgroundColor', e.target.value)} />
                    </div>
                    <button onClick={onResetLevel} style={{ marginTop: '10px', width: '100%' }}>Reset Level (R)</button>
                </>
            )}
             <button onClick={onShowInstructions} style={{ marginTop: '5px', width: '100%' }}>
                Instructions
            </button>
        </div>
    );
};

export default ControlsPanel;