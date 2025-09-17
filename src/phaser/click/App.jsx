import { useEffect } from 'react'
import './style.css'
import Phaser from 'phaser'

export default function App() {

    useEffect(() => {
        class GameScene extends Phaser.Scene {
            constructor() {
                super({ key: 'GameScene' });
                this.squareConfig = {
                    width: 50,
                    height: 50,
                    color: 0xff0000, // Phaser uses hex numbers for color
                    alpha: 0.5       // Phaser uses alpha for opacity (0-1)
                };
                this.lastClickedWorldCoords = null;
                this.previewSquare = null;
                this.addedSquaresGroup = null;
            }

            preload() {
                // No assets to load for this simple game
            }

            create() {
                this.cameras.main.setBackgroundColor('#ffffff'); // White background for the canvas

                // Group to hold all the squares added by the user
                this.addedSquaresGroup = this.add.group();

                // Graphics object for the preview square
                this.previewSquare = this.add.graphics();
                this.previewSquare.setDepth(1); // Ensure preview is on top
                this.previewSquare.setVisible(false); // Initially hidden

                // --- Input Handling ---
                this.input.on('pointerdown', (pointer) => {
                    this.lastClickedWorldCoords = { x: pointer.worldX, y: pointer.worldY };
                    document.getElementById('clickCoordsDisplay').textContent = `Clicked: (${pointer.worldX.toFixed(0)}, ${pointer.worldY.toFixed(0)})`;
                    document.getElementById('addSquareButton').disabled = false;
                    this.updatePreviewSquare(true); // Show preview at click location
                });

                this.input.on('pointermove', (pointer) => {
                    // If we haven't fixed a click location yet, update the preview to follow the mouse
                    if (!this.lastClickedWorldCoords) {
                        this.updatePreviewSquare(true, pointer.worldX, pointer.worldY);
                    }
                });

                // When pointer leaves the game canvas, hide the preview if it's just following mouse
                this.input.on('gameout', () => {
                    if (!this.lastClickedWorldCoords && this.previewSquare) {
                        this.previewSquare.setVisible(false);
                    }
                });


                // --- Initialize UI Listeners (called from HTML) ---
                this.initUIListeners();
                this.updateConfigFromUI(); // Get initial values from UI
            }

            updatePreviewSquare(show = true, x, y) {
                if (!this.previewSquare) return;

                this.previewSquare.clear(); // Clear previous drawing
                if (!show) {
                    this.previewSquare.setVisible(false);
                    return;
                }

                const previewX = x !== undefined ? x : (this.lastClickedWorldCoords ? this.lastClickedWorldCoords.x : 0);
                const previewY = y !== undefined ? y : (this.lastClickedWorldCoords ? this.lastClickedWorldCoords.y : 0);


                this.previewSquare.fillStyle(this.squareConfig.color, this.squareConfig.alpha * 0.7); // Preview is slightly more transparent
                this.previewSquare.fillRect(
                    previewX - this.squareConfig.width / 2,
                    previewY - this.squareConfig.height / 2,
                    this.squareConfig.width,
                    this.squareConfig.height
                );
                this.previewSquare.setVisible(true);
            }

            addConfiguredSquare() {
                if (!this.lastClickedWorldCoords) {
                    alert("Please click on the canvas to set a position first!");
                    return;
                }

                const newSquare = this.add.graphics();
                newSquare.fillStyle(this.squareConfig.color, this.squareConfig.alpha);
                newSquare.fillRect(
                    this.lastClickedWorldCoords.x - this.squareConfig.width / 2,
                    this.lastClickedWorldCoords.y - this.squareConfig.height / 2,
                    this.squareConfig.width,
                    this.squareConfig.height
                );

                this.addedSquaresGroup.add(newSquare);

                // Reset for next addition
                this.lastClickedWorldCoords = null;
                document.getElementById('clickCoordsDisplay').textContent = `Clicked: (none)`;
                document.getElementById('addSquareButton').disabled = true;
                if (this.previewSquare) this.previewSquare.setVisible(false); // Hide preview after adding
            }

            clearAllSquares() {
                this.addedSquaresGroup.clear(true, true); // true, true destroys children and their textures
                this.lastClickedWorldCoords = null;
                document.getElementById('clickCoordsDisplay').textContent = `Clicked: (none)`;
                document.getElementById('addSquareButton').disabled = true;
                if (this.previewSquare) this.previewSquare.setVisible(false);
            }

            updateConfigFromUI() {
                const width = parseInt(document.getElementById('squareWidth').value, 10);
                const height = parseInt(document.getElementById('squareHeight').value, 10);
                const colorString = document.getElementById('squareColor').value; // e.g., "#RRGGBB"
                const alpha = parseFloat(document.getElementById('squareOpacity').value);

                this.squareConfig.width = isNaN(width) ? 50 : width;
                this.squareConfig.height = isNaN(height) ? 50 : height;
                this.squareConfig.color = Phaser.Display.Color.HexStringToColor(colorString).color; // Convert to Phaser color number
                this.squareConfig.alpha = isNaN(alpha) ? 0.5 : alpha;

                // Update UI opacity value display
                document.getElementById('opacityValue').textContent = this.squareConfig.alpha.toFixed(2);
                // Update color preview swatch
                const r = (this.squareConfig.color >> 16) & 0xFF;
                const g = (this.squareConfig.color >> 8) & 0xFF;
                const b = this.squareConfig.color & 0xFF;
                document.getElementById('colorPreview').style.backgroundColor = `rgba(${r},${g},${b},${this.squareConfig.alpha})`;


                // If there's a fixed click location, update its preview
                if (this.lastClickedWorldCoords) {
                    this.updatePreviewSquare(true);
                }
                // If no fixed location, update the mouse-following preview (if pointer is over game)
                else if (this.input.activePointer.isOver) {
                    this.updatePreviewSquare(true, this.input.activePointer.worldX, this.input.activePointer.worldY);
                }

            }

            initUIListeners() {
                document.getElementById('squareWidth').addEventListener('input', () => this.updateConfigFromUI());
                document.getElementById('squareHeight').addEventListener('input', () => this.updateConfigFromUI());
                document.getElementById('squareColor').addEventListener('input', () => this.updateConfigFromUI());
                document.getElementById('squareOpacity').addEventListener('input', () => this.updateConfigFromUI());

                document.getElementById('addSquareButton').addEventListener('click', () => this.addConfiguredSquare());
                document.getElementById('clearSquaresButton').addEventListener('click', () => this.clearAllSquares());
            }

            update() {
                // Continuously update mouse-following preview if no click is set and pointer is over game
                if (!this.lastClickedWorldCoords && this.input.activePointer.isOver && this.previewSquare) {
                    this.updatePreviewSquare(true, this.input.activePointer.worldX, this.input.activePointer.worldY);
                }
            }
        }

        const config = {
            type: Phaser.AUTO, // Phaser will try WebGL first, then Canvas
            width: 800,
            height: 600,
            parent: 'phaser-game-container', // ID of the div to inject the canvas into
            scene: [GameScene],
            physics: { // Not strictly needed for this example, but good to include
                default: 'arcade',
                arcade: {
                    debug: false
                }
            }
        };

        const game = new Phaser.Game(config);
    })

    return <>
        <div>
            <div id="phaser-game-container"></div>

            <div id="controls-panel">
                <h3>Square Configuration</h3>
                <div class="control-group">
                    <label for="squareWidth">Width:</label>
                    <input type="number" id="squareWidth" value="50" min="10" />
                </div>
                <div class="control-group">
                    <label for="squareHeight">Height:</label>
                    <input type="number" id="squareHeight" value="50" min="10" />
                </div>
                <div class="control-group">
                    <label for="squareColor">Color:</label>
                    <input type="color" id="squareColor" value="#ff0000" />
                </div>
                <div class="control-group">
                    <label for="squareOpacity">Opacity (<span id="opacityValue">0.5</span>):</label>
                    <input type="range" id="squareOpacity" value="0.5" min="0" max="1" step="0.01" />
                </div>
                <div class="control-group">
                    <label>Preview:</label>
                    <div class="color-preview" id="colorPreview"></div>
                </div>

                <p id="clickCoordsDisplay">Clicked: (none)</p>

                <button id="addSquareButton" disabled>Add Square at Click</button>
                <button id="clearSquaresButton">Clear All Squares</button>
            </div>

            <script src="js/game.js"></script>
        </div>
    </>
}