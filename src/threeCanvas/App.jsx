// src/App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ThreeCanvas from './ThreeCanvas';
import ControlsPanel from './ControlsPanel';
// import OnScreenControls from './OnScreenControls';
import {
    initialLevel, ELEMENT_TYPES,
    // TILE_SIZE,
    DEFAULT_COLORS
} from './constants.ts';
// import './styles.css'; // We'll create this file

const App = () => {
    const [level, setLevel] = useState(initialLevel); // Current level structure
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
    const [boxes, setBoxes] = useState([]); // [{ id, x, y }]
    const [targets, setTargets] = useState([]);
    const [walls, setWalls] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won'
    const [moveHistory, setMoveHistory] = useState([]); // For undo, if desired later

    const [settings, setSettings] = useState({
        playerColor: DEFAULT_COLORS.player,
        boxColor: DEFAULT_COLORS.box,
        wallColor: DEFAULT_COLORS.wall,
        targetColor: DEFAULT_COLORS.target,
        gridColor: DEFAULT_COLORS.grid,
        backgroundColor: DEFAULT_COLORS.background,
    });

    const gameDimensions = useMemo(() => ({
        width: level[0]?.length || 0,
        height: level?.length || 0,
    }), [level]);

    const parseLevel = useCallback(() => {
        const newPlayerPos = { x: 0, y: 0 };
        const newBoxes = [];
        const newTargets = [];
        const newWalls = [];
        let boxIdCounter = 0;

        level.forEach((row, y) => {
            row.forEach((cell, x) => {
                switch (cell) {
                    case ELEMENT_TYPES.PLAYER:
                        newPlayerPos.x = x;
                        newPlayerPos.y = y;
                        break;
                    case ELEMENT_TYPES.BOX:
                        newBoxes.push({ id: `box-${boxIdCounter++}`, x, y });
                        break;
                    case ELEMENT_TYPES.TARGET:
                        newTargets.push({ x, y });
                        break;
                    case ELEMENT_TYPES.WALL:
                        newWalls.push({ x, y });
                        break;
                    case ELEMENT_TYPES.BOX_ON_TARGET: // If you use this
                        newBoxes.push({ id: `box-${boxIdCounter++}`, x, y });
                        newTargets.push({ x, y });
                        break;
                    default:
                        break;
                }
            });
        });
        setPlayerPos(newPlayerPos);
        setBoxes(newBoxes);
        setTargets(newTargets);
        setWalls(newWalls);
        setGameStatus('playing');
        setMoveHistory([]);
    }, [level]); // Add 'level' as dependency

    useEffect(() => {
        parseLevel();
    }, [parseLevel]); // parseLevel will change if 'level' changes (for future multi-level games)

    const checkWinCondition = useCallback(() => {
        if (targets.length === 0 || boxes.length === 0) return false;
        const won = targets.every(target =>
            boxes.some(box => box.x === target.x && box.y === target.y)
        );
        if (won) {
            setGameStatus('won');
            // setTimeout(() => alert("恭喜通关！"), 100); // alert can mess with focus
        }
        return won;
    }, [boxes, targets]);

    useEffect(() => {
        if (gameStatus === 'playing') {
            checkWinCondition();
        }
    }, [boxes, gameStatus, checkWinCondition]);


    const handleMove = useCallback((dx, dy) => {
        if (gameStatus === 'won') return;

        const newPlayerX = playerPos.x + dx;
        const newPlayerY = playerPos.y + dy;

        // Boundary check
        if (newPlayerX < 0 || newPlayerX >= gameDimensions.width ||
            newPlayerY < 0 || newPlayerY >= gameDimensions.height) {
            return;
        }

        // Wall collision check
        if (walls.some(wall => wall.x === newPlayerX && wall.y === newPlayerY)) {
            return;
        }

        // Box collision/push check
        const boxIndex = boxes.findIndex(box => box.x === newPlayerX && box.y === newPlayerY);
        if (boxIndex !== -1) {
            const newBoxX = newPlayerX + dx;
            const newBoxY = newPlayerY + dy;

            // Boundary check for box
            if (newBoxX < 0 || newBoxX >= gameDimensions.width ||
                newBoxY < 0 || newBoxY >= gameDimensions.height) {
                return;
            }
            // Box collision with another box or wall
            if (walls.some(wall => wall.x === newBoxX && wall.y === newBoxY) ||
                boxes.some(b => b.x === newBoxX && b.y === newBoxY)) {
                return;
            }

            // Move box
            const newBoxes = [...boxes];
            newBoxes[boxIndex] = { ...newBoxes[boxIndex], x: newBoxX, y: newBoxY };
            setBoxes(newBoxes);
        }

        // Record move for undo (optional)
        // setMoveHistory(prev => [...prev, { playerPos, boxes }]);

        // Move player
        setPlayerPos({ x: newPlayerX, y: newPlayerY });

    }, [playerPos, boxes, walls, gameDimensions, gameStatus]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStatus === 'won' && e.key.toLowerCase() !== 'r') return;

            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    handleMove(0, -1);
                    break;
                case 'arrowdown':
                case 's':
                    handleMove(0, 1);
                    break;
                case 'arrowleft':
                case 'a':
                    handleMove(-1, 0);
                    break;
                case 'arrowright':
                case 'd':
                    handleMove(1, 0);
                    break;
                case 'r':
                    parseLevel(); // Reset
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMove, parseLevel, gameStatus]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const showInstructions = () => {
        alert("Sokoban Game Instructions:\n\n- Use Arrow Keys or WASD to move the player (green cube).\n- Push the yellow boxes onto the red target circles.\n- All targets must be covered by boxes to win.\n- Press 'R' to reset the current level.\n- You can customize colors in the 'Show Settings' panel.\n- On-screen directional buttons are draggable.");
    };

    // Prepare data for ThreeCanvas
    const playerDataForCanvas = useMemo(() => ({
        ...playerPos,
        color: settings.playerColor
    }), [playerPos, settings.playerColor]);

    const boxesDataForCanvas = useMemo(() => boxes.map(box => ({
        ...box,
        color: settings.boxColor
    })), [boxes, settings.boxColor]);

    const wallsDataForCanvas = useMemo(() => walls.map(wall => ({
        ...wall,
        color: settings.wallColor
    })), [walls, settings.wallColor]);

    const targetsDataForCanvas = useMemo(() => targets.map(target => ({
        ...target,
        color: settings.targetColor
    })), [targets, settings.targetColor]);


    return (
        <div className="h-full">
            {gameStatus === 'won' && (
                <div className="win-message">
                    Congratulations! You Won!
                    <button onClick={parseLevel}>Play Again (R)</button>
                </div>
            )}
            <div id="info-text" style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 10 }}>
                Use Arrow/WASD keys to move. R to reset.
            </div>

            <ThreeCanvas
                playerData={playerDataForCanvas}
                boxesData={boxesDataForCanvas}
                wallsData={wallsDataForCanvas}
                targetsData={targetsDataForCanvas}
                gameDimensions={gameDimensions}
                settings={settings}
            />
            <ControlsPanel
                settings={settings}
                onSettingChange={handleSettingChange}
                onResetLevel={parseLevel}
                onShowInstructions={showInstructions}
            />
            {/* <OnScreenControls onMove={handleMove} /> */}
        </div>
    );
};

export default App;