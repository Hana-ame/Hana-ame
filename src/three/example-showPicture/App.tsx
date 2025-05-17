// src/App.tsx or your Three.js component file
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const App: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const animatedMeshRef = useRef<THREE.Mesh | null>(null); // Ref to the mesh whose texture will change
    const materialRef = useRef<THREE.MeshStandardMaterial | null>(null); // Ref to its material

    // Refs for cleanup
    const geometriesRef = useRef<THREE.BufferGeometry[]>([]);
    const materialsForCleanupRef = useRef<THREE.Material[]>([]); // All materials for cleanup
    const texturesForCleanupRef = useRef<THREE.Texture[]>([]);
    const meshesForCleanupRef = useRef<THREE.Mesh[]>([]);


    // Image URLs for animation (replace with your image URLs)
    // Ensure servers allow CORS
    const imageFrameUrls = [
        'https://picsum.photos/seed/frame1/512/512', // Frame 1
        'https://picsum.photos/seed/frame2/512/512', // Frame 2
        'https://picsum.photos/seed/frame3/512/512', // Frame 3 (add more if needed)
    ];

    const [loadedTextures, setLoadedTextures] = useState<THREE.Texture[]>([]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

    // --- Texture Loading Effect ---
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader();
        const promises = imageFrameUrls.map(url =>
            new Promise<THREE.Texture>((resolve, reject) => {
                textureLoader.load(url,
                    (texture) => {
                        texturesForCleanupRef.current.push(texture); // Add to cleanup list
                        resolve(texture);
                    },
                    undefined,
                    (error) => reject(error)
                );
            })
        );

        Promise.all(promises)
            .then(textures => {
                console.log(`${textures.length} textures loaded successfully`);
                setLoadedTextures(textures);
            })
            .catch(error => {
                console.error('Error loading one or more textures:', error);
            });

        // Cleanup textures on component unmount
        return () => {
            texturesForCleanupRef.current.forEach(texture => texture.dispose());
            texturesForCleanupRef.current = [];
        };
    }, []); // Runs once on mount


    // --- Main Three.js Setup and Animation Timer Effect ---
    useEffect(() => {
        if (!mountRef.current || loadedTextures.length === 0) return; // Wait for textures

        const currentMount = mountRef.current;

        // 1. Scene
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0x282c34);

        // 2. Camera
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        cameraRef.current = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        cameraRef.current.position.set(0, 0, 3); // Adjusted position for a 2x2 plane

        // 3. Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(rendererRef.current.domElement);

        // 4. OrbitControls
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;

        // 5. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        sceneRef.current.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        sceneRef.current.add(directionalLight);

        // 6. Geometry (e.g., a simple plane)
        // Using a PlaneGeometry for simplicity here, but you can use your irregular one.
        const geometry = new THREE.PlaneGeometry(2, 2); // A 2x2 plane
        geometriesRef.current.push(geometry);

        // 7. Material - initially with the first frame
        materialRef.current = new THREE.MeshStandardMaterial({
            map: loadedTextures[0], // Start with the first loaded texture
            side: THREE.DoubleSide,
            roughness: 0.7,
            metalness: 0.1,
            transparent: true, // If your images have alpha and you need it
        });
        materialsForCleanupRef.current.push(materialRef.current);


        // 8. Mesh
        animatedMeshRef.current = new THREE.Mesh(geometry, materialRef.current);
        meshesForCleanupRef.current.push(animatedMeshRef.current);
        sceneRef.current.add(animatedMeshRef.current);


        // --- Animation Timer ---
        const timerId = setInterval(() => {
            setCurrentFrameIndex(prevIndex => (prevIndex + 1) % loadedTextures.length);
        }, 1000); // Change image every 1000ms (1 second)


        // Animation Loop for rendering and controls
        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            controlsRef.current?.update();
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        // Handle Resize
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

        // Cleanup
        return () => {
            clearInterval(timerId); // Clear the interval timer
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            window.removeEventListener('resize', handleResize);

            // Dispose other Three.js objects
            geometriesRef.current.forEach(g => g.dispose());
            materialsForCleanupRef.current.forEach(m => {
                for (const key in m) {
                    const value = (m as any)[key];
                    if (value && typeof value === 'object' && 'dispose' in value && typeof value.dispose === 'function') {
                        value.dispose();
                    }
                }
                m.dispose();
            });
            meshesForCleanupRef.current.forEach(mesh => sceneRef.current?.remove(mesh));

            geometriesRef.current = [];
            materialsForCleanupRef.current = [];
            meshesForCleanupRef.current = [];


            controlsRef.current?.dispose();
            if (rendererRef.current?.domElement && currentMount.contains(rendererRef.current.domElement)) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current?.dispose();
            sceneRef.current = null;
        };
    }, [loadedTextures]); // Re-run effect if loadedTextures array changes (after loading)

    // --- Effect to Update Texture on Mesh when currentFrameIndex changes ---
    useEffect(() => {
        if (materialRef.current && loadedTextures.length > 0 && loadedTextures[currentFrameIndex]) {
            materialRef.current.map = loadedTextures[currentFrameIndex];
            materialRef.current.needsUpdate = true; // Important: Tell Three.js the material has changed
            console.log(`Switched to frame ${currentFrameIndex + 1}`);
        }
    }, [currentFrameIndex, loadedTextures]);


    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};

export default App;