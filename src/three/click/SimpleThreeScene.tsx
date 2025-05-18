import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const SimpleThreeScene: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cubeRef = useRef<THREE.Mesh | null>(null); // To animate the cube
    const animationFrameIdRef = useRef<number | null>(null); // To cancel animation frame

    // Encapsulate resize logic
    const handleResize = useCallback(() => {
        if (cameraRef.current && rendererRef.current && mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            // Update OrthographicCamera
            cameraRef.current.left = width / -2;
            cameraRef.current.right = width / 2;
            cameraRef.current.top = height / 2;
            cameraRef.current.bottom = height / -2;
            cameraRef.current.updateProjectionMatrix();

            rendererRef.current.setSize(width, height);
        }
    }, []); // No dependencies, as refs don't change to trigger re-creation

    useEffect(() => {
        // --- 1. Initialization ---
        if (!mountRef.current) {
            return; // Mount point not available yet
        }

        const currentMount = mountRef.current; // Capture for cleanup closure

        // Scene
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0x222222); // Light gray background

        // Camera (Orthographic)
        const aspect = currentMount.clientWidth / currentMount.clientHeight;
        const frustumSize = 5; // Defines the visible area size
        cameraRef.current = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, // left
            frustumSize * aspect / 2,  // right
            frustumSize / 2,           // top
            frustumSize / -2,          // bottom
            0.1,                       // near
            1000                       // far
        );
        cameraRef.current.position.z = 5; // Move camera back to see the cube at (0,0,0)

        // Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(rendererRef.current.domElement); // Add canvas to the div

        // --- 2. Add Objects ---
        const geometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green
        cubeRef.current = new THREE.Mesh(geometry, material);
        sceneRef.current.add(cubeRef.current);

        // --- 3. Animation Loop ---
        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);

            if (cubeRef.current) {
                cubeRef.current.rotation.x += 0.01;
                cubeRef.current.rotation.y += 0.01;
            }

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        // --- 4. Handle Resize ---
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call to set size

        // --- 5. Cleanup ---
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                currentMount.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }
            // Dispose Three.js objects
            if (cubeRef.current) {
                cubeRef.current.geometry.dispose();
                if (Array.isArray(cubeRef.current.material)) {
                    cubeRef.current.material.forEach(mat => mat.dispose());
                } else {
                    (cubeRef.current.material as THREE.Material).dispose();
                }
            }
            // Clear refs
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            cubeRef.current = null;
        };
    }, [handleResize]); // Re-run effect if handleResize changes (it won't due to useCallback with empty deps)

    return <div ref={mountRef} style={{ width: '100%', height: '100%', border: '1px solid black' }} />;
};

export default SimpleThreeScene;