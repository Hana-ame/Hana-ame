// src/App.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PlaneData, NewPlaneConfig, ClickedCoords } from './types'; // Import types

// Make sure Tailwind is imported in your main index.css or equivalent
// import './index.css'; // Assuming your global styles import tailwind here

const App: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null); // Ref for the canvas container
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const planesGroupRef = useRef<THREE.Group | null>(null); // Group to hold all plane meshes

    // State for the list of planes currently rendered
    const [planes, setPlanes] = useState<PlaneData[]>([]);

    // State for the configuration of the next plane to be added
    const [newPlaneConfig, setNewPlaneConfig] = useState<NewPlaneConfig>({
        width: 1,
        height: 1,
        color: '#ff0000', // Default red
    });

    // State for the last clicked coordinates on the canvas (in world space)
    const [clickedCoords, setClickedCoords] = useState<ClickedCoords | null>(null);

    // State for the control panel's expanded/collapsed state
    const [isPanelExpanded, setIsPanelExpanded] = useState(true);

    // --- Three.js Setup Effect ---
    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;

        // Scene
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0xeeeeee); // Light gray background

        // Orthographic Camera
        // Bounds related to the container size
        const aspect = width / height;
        const frustumSize = 10; // Controls the visible area scale
        cameraRef.current = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, // left
            frustumSize * aspect / 2,  // right
            frustumSize / 2,           // top
            frustumSize / -2,          // bottom
            1,                         // near
            1000                       // far
        );
        cameraRef.current.position.set(0, 0, 10); // Positioned to look at Z=0 plane
        cameraRef.current.lookAt(0, 0, 0); // Look at the origin

        // Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(rendererRef.current.domElement);

        // Group for planes - makes it easy to clear and re-add
        planesGroupRef.current = new THREE.Group();
        sceneRef.current.add(planesGroupRef.current);

        // Animation Loop (minimal, just for rendering)
        const animate = () => {
            // No need for requestAnimationFrame if nothing is animating
            // Only render when needed (e.g., after pose update or resize)
            requestAnimationFrame(animate);
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        // Initial render
        animate();


        // Handle Resize
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current && currentMount) {
                const newWidth = currentMount.clientWidth;
                const newHeight = currentMount.clientHeight;
                const newAspect = newWidth / newHeight;

                // Update orthographic camera bounds based on new aspect
                const currentFrustumSize = cameraRef.current.top * 2; // Get the current frustum size from top/bottom
                 cameraRef.current.left = currentFrustumSize * newAspect / -2;
                 cameraRef.current.right = currentFrustumSize * newAspect / 2;
                 cameraRef.current.top = currentFrustumSize / 2;
                 cameraRef.current.bottom = currentFrustumSize / -2;


                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(newWidth, newHeight);
                rendererRef.current.render(sceneRef.current!, cameraRef.current); // Re-render after resize
            }
        };
        window.addEventListener('resize', handleResize);

        // --- Canvas Click Handling ---
        const handleCanvasClick = (event: MouseEvent) => {
            if (!cameraRef.current || !currentMount) return;

            // Get click coordinates relative to the canvas element
            const rect = currentMount.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Convert screen coordinates to normalized device coordinates (NDC)
            const ndcX = (mouseX / rect.width) * 2 - 1;
            const ndcY = -(mouseY / rect.height) * 2 + 1; // Y is inverted in screen vs NDC

            // Create a 3D vector in NDC space
            const vector = new THREE.Vector3(ndcX, ndcY, 0.5); // z=0.5 is arbitrary depth within frustum

            // Unproject the vector from NDC to world space
            vector.unproject(cameraRef.current);

            // Calculate intersection point with the Z=0 plane
            // This assumes the camera is not exactly on the Z=0 plane and looks at it
            // A simpler way for orthographic camera looking at Z=0 is direct mapping:
             const worldX = vector.x;
             const worldY = vector.y;


            setClickedCoords({ x: worldX, y: worldY });
            console.log(`Clicked World Coords: X=${worldX.toFixed(2)}, Y=${worldY.toFixed(2)}`);
        };
        currentMount.addEventListener('click', handleCanvasClick);


        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            currentMount.removeEventListener('click', handleCanvasClick);

            // Dispose Three.js objects
            sceneRef.current?.traverse(object => {
                // Dispose geometries and materials
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material?.dispose();
                    }
                }
            });
            // Dispose renderer
            rendererRef.current?.dispose();

            // Remove canvas from DOM
            if (currentMount && rendererRef.current?.domElement) {
                currentMount.removeChild(rendererRef.current.domElement);
            }

            // Clear refs
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            planesGroupRef.current = null;
        };
    }, []); // Empty dependency array: runs once on mount and cleans up on unmount

    // --- Effect to Render Planes List ---
    useEffect(() => {
        if (!planesGroupRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

        // Clear existing planes from the group and dispose their resources
        while (planesGroupRef.current.children.length > 0) {
            const child = planesGroupRef.current.children[0];
             if (child instanceof THREE.Mesh) {
                child.geometry?.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material?.dispose();
                }
            }
            planesGroupRef.current.remove(child);
        }

        // Add new planes based on the 'planes' state
        planes.forEach(planeData => {
            const geometry = new THREE.PlaneGeometry(planeData.width, planeData.height);
            // Use MeshBasicMaterial as we don't need lighting for simple colors
            const material = new THREE.MeshBasicMaterial({ color: planeData.color, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);

            // Position the plane using the stored x, y coordinates (center of the plane)
            mesh.position.set(planeData.x, planeData.y, 0); // Render on the Z=0 plane

            planesGroupRef.current!.add(mesh);
        });

        // Re-render the scene after updating planes
        rendererRef.current.render(sceneRef.current, cameraRef.current);

    }, [planes]); // Dependency array: rerun this effect whenever the 'planes' state changes

    // --- Control Panel Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setNewPlaneConfig(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handleAddPlane = () => {
        if (!clickedCoords) {
            alert("Please click on the canvas to select a position first.");
            return;
        }
        const newPlane: PlaneData = {
            id: Date.now().toString(), // Simple unique ID
            ...newPlaneConfig,
            x: clickedCoords.x,
            y: clickedCoords.y,
        };
        setPlanes(prev => [...prev, newPlane]);
        setClickedCoords(null); // Clear clicked coords after adding
    };

    const handleClearPlanes = () => {
        setPlanes([]);
        setClickedCoords(null); // Clear clicked coords
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden relative">
            {/* Canvas Container */}
            <div ref={mountRef} className="flex-grow h-full border-r border-gray-300">
                {/* Three.js will render here */}
            </div>

            {/* Control Panel */}
            <div className={`
                fixed top-4 right-4 p-6 bg-gray-800 bg-opacity-70 text-white rounded-lg shadow-lg
                transition-all ease-in-out duration-300
                ${isPanelExpanded ? 'w-80' : 'w-16 overflow-hidden'}
            `}>
                {/* Toggle Button */}
                <button
                    onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                    className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded-full hover:bg-gray-600 transition"
                    aria-label={isPanelExpanded ? "Collapse Panel" : "Expand Panel"}
                >
                    {isPanelExpanded ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                       </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                       </svg>
                    )}
                </button>

                {/* Panel Content - Only visible when expanded */}
                {isPanelExpanded && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="width" className="block text-sm font-medium">Width:</label>
                            <input
                                type="number"
                                id="width"
                                name="width"
                                value={newPlaneConfig.width}
                                onChange={handleInputChange}
                                step="0.1"
                                min="0.1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium">Height:</label>
                            <input
                                type="number"
                                id="height"
                                name="height"
                                value={newPlaneConfig.height}
                                onChange={handleInputChange}
                                step="0.1"
                                min="0.1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium">Color:</label>
                            <input
                                type="color"
                                id="color"
                                name="color"
                                value={newPlaneConfig.color}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1"
                            />
                        </div>

                        {/* Display clicked coordinates */}
                        <div className="text-sm">
                            Clicked Pos: {clickedCoords ? `X: ${clickedCoords.x.toFixed(2)}, Y: ${clickedCoords.y.toFixed(2)}` : 'Click on canvas'}
                        </div>

                        {/* Action Buttons */}
                        <button
                            onClick={handleAddPlane}
                            disabled={!clickedCoords}
                            className={`
                                w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                                ${clickedCoords ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-gray-400 cursor-not-allowed'}
                            `}
                        >
                            Add Plane
                        </button>

                        <button
                             onClick={handleClearPlanes}
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;