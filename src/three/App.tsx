// src/App.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const App: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    // Store meshes, geometries, and materials for cleanup
    const meshesRef = useRef<THREE.Mesh[]>([]);
    const geometriesRef = useRef<THREE.BufferGeometry[]>([]);
    const materialsRef = useRef<THREE.Material[]>([]);


    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // 1. Scene
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0x282c34); // Dark background

        // 2. Camera
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        cameraRef.current = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        cameraRef.current.position.set(0, 1, 5); // Positioned to see the XZ plane
        cameraRef.current.lookAt(0, 0, 0);

        // 3. Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(rendererRef.current.domElement);

        // 4. OrbitControls
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.screenSpacePanning = false;
        controlsRef.current.minDistance = 1;
        controlsRef.current.maxDistance = 50;
        // controlsRef.current.maxPolarAngle = Math.PI / 2; // Prevent looking from below

        // 5. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        sceneRef.current.add(ambientLight);
        materialsRef.current.push(ambientLight as any); // Not a material, but for general cleanup tracking

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        sceneRef.current.add(directionalLight);
        materialsRef.current.push(directionalLight as any);

        // 6. Geometries and Materials

        // Helper to create and add meshes
        const createAndAddMesh = (
            geometry: THREE.BufferGeometry,
            materialProps: THREE.MeshStandardMaterialParameters,
            position: [number, number, number],
            rotation?: [number, number, number]
        ) => {
            geometriesRef.current.push(geometry);
            const material = new THREE.MeshStandardMaterial({
                ...materialProps,
                side: THREE.DoubleSide, // Important for 2D shapes
            });
            materialsRef.current.push(material);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...position);
            if (rotation) mesh.rotation.set(...rotation);
            sceneRef.current!.add(mesh);
            meshesRef.current.push(mesh);
        };

        // --- Displaying 2D Geometries ---

        // PlaneGeometry
        createAndAddMesh(
            new THREE.PlaneGeometry(2, 2),
            { color: 0xff0000, roughness: 0.5, metalness: 0.1 }, // Red
            [-3, 1, 0]
        );

        // CircleGeometry
        createAndAddMesh(
            new THREE.CircleGeometry(1, 32), // radius, segments
            { color: 0x00ff00, roughness: 0.5, metalness: 0.1 }, // Green
            [0, 1, 0]
        );

        // RingGeometry
        createAndAddMesh(
            new THREE.RingGeometry(0.5, 1, 32), // innerRadius, outerRadius, thetaSegments
            { color: 0x0000ff, roughness: 0.5, metalness: 0.1 }, // Blue
            [3, 1, 0]
        );

        // ShapeGeometry (Example: a Triangle)
        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(-1, -0.5);
        triangleShape.lineTo(1, -0.5);
        triangleShape.lineTo(0, 1);
        triangleShape.lineTo(-1, -0.5); // close path
        createAndAddMesh(
            new THREE.ShapeGeometry(triangleShape),
            { color: 0xffff00, roughness: 0.5, metalness: 0.1 }, // Yellow
            [-3, 1, -3]
        );

        // ShapeGeometry (Example: a Heart - more complex)
        const heartShape = new THREE.Shape();
        const x = 0, y = -0.5; // Offset for easier positioning
        heartShape.moveTo(x + 0.5, y + 0.5);
        heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
        heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
        heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
        heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
        heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
        heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
        createAndAddMesh(
            new THREE.ShapeGeometry(heartShape),
            { color: 0xff00ff, roughness: 0.5, metalness: 0.1 }, // Magenta
            [0, 0.5, -3] // Adjusted y to roughly center it
        );

        // Plane as a "floor" for context (optional)
        const floorGeometry = new THREE.PlaneGeometry(10, 10);
        geometriesRef.current.push(floorGeometry);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8, metalness: 0.2, side: THREE.DoubleSide });
        materialsRef.current.push(floorMaterial);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        floor.position.y = -0.01; // Slightly below other objects
        sceneRef.current!.add(floor);
        meshesRef.current.push(floor);


        // 7. Animation Loop
        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            controlsRef.current?.update(); // only required if controls.enableDamping or controls.autoRotate are set to true
            rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
        };
        animate();

        // 8. Handle Resize
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current && currentMount) {
                const newWidth = currentMount.clientWidth;
                const newHeight = currentMount.clientHeight;

                cameraRef.current.aspect = newWidth / newHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(newWidth, newHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // 9. Cleanup
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            window.removeEventListener('resize', handleResize);

            // Dispose Three.js objects
            geometriesRef.current.forEach(geometry => geometry.dispose());
            materialsRef.current.forEach(material => {
                if (typeof (material as any).dispose === 'function') {
                    (material as any).dispose();
                }
                // For textures in materials
                for (const key in material) {
                    const value = (material as any)[key];
                    if (value && typeof value === 'object' && 'dispose' in value && typeof value.dispose === 'function') {
                        value.dispose();
                    }
                }
            });
            meshesRef.current.forEach(mesh => sceneRef.current?.remove(mesh));

            controlsRef.current?.dispose();
            rendererRef.current?.dispose();

            if (currentMount && rendererRef.current?.domElement) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            // Clear refs
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            controlsRef.current = null;
            meshesRef.current = [];
            geometriesRef.current = [];
            materialsRef.current = [];
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};

export default App;