// src/constants.js
export const TILE_SIZE = 40;

// 0: empty, 1: wall, 2: player_start, 3: target, 4: box_start, 5: box_on_target_start
export const initialLevel = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,3,4,2,0,0,1],
    [1,0,0,1,4,3,0,1],
    [1,1,1,1,1,1,1,1]
];

export const ELEMENT_TYPES = {
    EMPTY: 0,
    WALL: 1,
    PLAYER: 2,
    TARGET: 3,
    BOX: 4,
    BOX_ON_TARGET: 5, // Could be useful for initial setup if a box starts on a target
};

export const DEFAULT_COLORS = {
    player: '#00ff00', // Green
    box: '#ffff00',    // Yellow
    wall: '#888888',    // Dark Gray
    target: '#ff0000',  // Red
    grid: '#444444',
    background: '#282c34',
};