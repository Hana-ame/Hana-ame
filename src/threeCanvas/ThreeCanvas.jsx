// src/components/ThreeCanvas.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TILE_SIZE, DEFAULT_COLORS } from './constants';

const ThreeCanvas = ({
    playerData, // { x, y, color } grid coordinates
    boxesData,  // [{ id, x, y, color }, ...] grid coordinates
    wallsData,  // [{ x, y, color }, ...] grid coordinates
    targetsData, // [{ x, y, color }, ...] grid coordinates
    gameDimensions, // { width, height } of the level in tiles
    settings
}) => {
    const mountRef = useRef(null); // 加载用的div
    const sceneRef = useRef(null); // THREE.Scene, 存储一系列的需要绘制的对象
    const cameraRef = useRef(null); // THREE.OrthographicCamera
    const rendererRef = useRef(null); // THREE.WebGLRenderer
    const gameElementsGroupRef = useRef(null); // To easily clear and re-add game specific meshes

    useEffect(() => {
        // Basic Three.js setup
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(settings?.backgroundColor || DEFAULT_COLORS.background);

        // Orthographic Camera
        // Centering the view on the game board
        const gameWidthWorld = gameDimensions.width * TILE_SIZE;
        const gameHeightWorld = gameDimensions.height * TILE_SIZE;

        cameraRef.current = new THREE.OrthographicCamera(
            -width / 2, width / 2,
            height / 2, -height / 2,
            1, 1000
        );
        // Position camera to look down, centered on the game board
        cameraRef.current.position.set(gameWidthWorld / 2 - TILE_SIZE / 2, 200, gameHeightWorld / 2 - TILE_SIZE / 2);
        cameraRef.current.lookAt(gameWidthWorld / 2 - TILE_SIZE / 2, 0, gameHeightWorld / 2 - TILE_SIZE / 2);
        cameraRef.current.zoom = Math.min(width / gameWidthWorld, height / gameHeightWorld) * 0.8; // Adjust zoom
        cameraRef.current.updateProjectionMatrix();


        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(width, height);
        mountRef.current.appendChild(rendererRef.current.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        sceneRef.current.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 75);
        sceneRef.current.add(directionalLight);

        // Grid Helper (optional, but good for orientation)
        const gridHelper = new THREE.GridHelper(
            Math.max(gameWidthWorld, gameHeightWorld) + TILE_SIZE * 2,
            Math.max(gameDimensions.width, gameDimensions.height) + 2,
            settings?.gridColor || DEFAULT_COLORS.grid,
            settings?.gridColor || DEFAULT_COLORS.grid
        );
        gridHelper.position.set(gameWidthWorld/2 - TILE_SIZE/2, 0, gameHeightWorld/2 - TILE_SIZE/2);
        gridHelper.rotation.x = 0; // For XZ plane view
        sceneRef.current.add(gridHelper);

        // Group for dynamic game elements
        gameElementsGroupRef.current = new THREE.Group();
        sceneRef.current.add(gameElementsGroupRef.current);

        const animate = () => {
            requestAnimationFrame(animate);
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animate();

        const handleResize = () => {
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            rendererRef.current.setSize(w, h);
            cameraRef.current.left = -w / 2;
            cameraRef.current.right = w / 2;
            cameraRef.current.top = h / 2;
            cameraRef.current.bottom = -h / 2;
            // Re-calculate zoom on resize
            cameraRef.current.zoom = Math.min(w / gameWidthWorld, h / gameHeightWorld) * 0.8;
            cameraRef.current.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && rendererRef.current.domElement) {
                 // eslint-disable-next-line
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
            // Dispose Three.js objects
            rendererRef.current.dispose();
            // You should also dispose geometries, materials, textures in a real app
        };
    }, [gameDimensions, settings?.backgroundColor, settings?.gridColor]); // Re-init if gameDimensions or critical settings change

    // Effect to update game elements
    useEffect(() => {
        if (!sceneRef.current || !gameElementsGroupRef.current) return;

        // Clear previous elements
        while (gameElementsGroupRef.current.children.length > 0) {
            const child = gameElementsGroupRef.current.children[0];
            gameElementsGroupRef.current.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }

        // Create Walls
        wallsData.forEach(wall => {
            // const geometry = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);
            const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
            const material = new THREE.MeshPhongMaterial({ color: wall.color, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2; // 转为水平面（XZ平面） 
            mesh.position.set(wall.x * TILE_SIZE, TILE_SIZE / 2, wall.y * TILE_SIZE);
            gameElementsGroupRef.current.add(mesh);
        });

        // Create Targets
        targetsData.forEach(target => {
            const geometry = new THREE.RingGeometry(TILE_SIZE * 0.25, TILE_SIZE * 0.35, 32);
            const material = new THREE.MeshBasicMaterial({
                color: target.color,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(target.x * TILE_SIZE, 0.1, target.y * TILE_SIZE); // Slightly above ground
            gameElementsGroupRef.current.add(mesh);
        });

        // Create Boxes
        boxesData.forEach(box => {
            const geometry = new THREE.BoxGeometry(TILE_SIZE * 0.8, TILE_SIZE * 0.8, TILE_SIZE * 0.8);
            const material = new THREE.MeshPhongMaterial({ color: box.color });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(box.x * TILE_SIZE, TILE_SIZE / 2, box.y * TILE_SIZE);
            gameElementsGroupRef.current.add(mesh);
        });

        // Create Player
        if (playerData) {
            const geometry = new THREE.BoxGeometry(TILE_SIZE * 0.75, TILE_SIZE * 0.75, TILE_SIZE * 0.75);
            const material = new THREE.MeshPhongMaterial({ color: playerData.color });
            const playerMesh = new THREE.Mesh(geometry, material);
            playerMesh.position.set(playerData.x * TILE_SIZE, TILE_SIZE / 2, playerData.y * TILE_SIZE);
            gameElementsGroupRef.current.add(playerMesh);
        }

    }, [playerData, boxesData, wallsData, targetsData]); // Re-render elements if data changes

    return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }} />;
};

export default ThreeCanvas;