// src/App.tsx
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { PlaneData, NewPlaneConfig, ClickedCoords } from './types'; // Import updated types

// Make sure Tailwind is imported in your main index.css or equivalent
// import './index.css'; // Assuming your global styles import tailwind here

const App: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null); // Ref for the canvas container
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const planesGroupRef = useRef<THREE.Group | null>(null); // Group to hold all permanent plane meshes

    // Refs for the preview plane mesh and its material
    const previewMeshRef = useRef<THREE.Mesh | null>(null);
    const previewMaterialRef = useRef<THREE.Material | null>(null);

    // State for the list of planes currently rendered (permanent planes)
    const [planes, setPlanes] = useState<PlaneData[]>([]);

    // State for the configuration of the next plane to be added
    const [newPlaneConfig, setNewPlaneConfig] = useState<NewPlaneConfig>({
        width: 1,
        height: 1,
        color: '#ff0000', // Default red
        opacity: 0.5, // Default semi-transparent
    });

    // State for the last clicked coordinates on the canvas (in world space)
    const [clickedCoords, setClickedCoords] = useState<ClickedCoords | null>(null);

    // State for the control panel's expanded/collapsed state
    const [isPanelExpanded, setIsPanelExpanded] = useState(true);

    // Helper to convert hex color and opacity to rgba CSS string
    const getRgbaColor = useCallback((hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }, []);

    // Memoize the RGBA color string for the preview material and CSS display
    const previewRgbaColor = useMemo(() => getRgbaColor(newPlaneConfig.color, newPlaneConfig.opacity), [newPlaneConfig.color, newPlaneConfig.opacity, getRgbaColor]);


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

        // Group for permanent planes
        planesGroupRef.current = new THREE.Group();
        planesGroupRef.current.name = "PermanentPlanesGroup";
        sceneRef.current.add(planesGroupRef.current);

        // Animation Loop (minimal, just for rendering)
        const animate = () => {
            // No need for requestAnimationFrame if nothing is animating
            // Only render when needed (e.g., after pose update or resize)
            window.requestAnimationFrame(animate);
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

                const currentFrustumSize = cameraRef.current.top * 2;
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

            const rect = currentMount.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // 平面直角坐标系
            // Convert screen coordinates to normalized device coordinates (NDC)
            const ndcX = (mouseX / rect.width) * 2 - 1;
            const ndcY = -(mouseY / rect.height) * 2 + 1;

            // Use a vector representing the click point in screen space, at the Z=0 plane depth
            const vector = new THREE.Vector3(ndcX, ndcY, 0); // Z=0 because Orthographic camera looks at Z=0

            // 前一个是[-1,1]的比例,后一个是camera范围里的大小
            // Unproject the vector from NDC to world space
            vector.unproject(cameraRef.current);

            // For an orthographic camera looking at Z=0, the unprojected vector's x and y
            // directly give the world coordinates on the Z=0 plane.
            setClickedCoords({ x: vector.x, y: vector.y });
            console.log(`Clicked World Coords: X=${vector.x.toFixed(2)}, Y=${vector.y.toFixed(2)}`);

            // Note: The preview mesh is handled by a separate effect triggered by setClickedCoords
        };
        currentMount.addEventListener('click', handleCanvasClick);


        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            currentMount.removeEventListener('click', handleCanvasClick);

            // Dispose Three.js objects associated with the scene
            sceneRef.current?.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material?.dispose();
                    }
                }
            });

            // Dispose preview mesh and material if they exist (though the effect below also cleans up)
            if (previewMeshRef.current) {
                previewMeshRef.current.geometry?.dispose();
                if (Array.isArray(previewMeshRef.current.material)) {
                    previewMeshRef.current.material.forEach(material => material.dispose());
                } else {
                    previewMeshRef.current.material?.dispose();
                }
                planesGroupRef.current?.remove(previewMeshRef.current); // Remove from group if it's there
            }
            previewMaterialRef.current?.dispose(); // Ensure material is disposed

            rendererRef.current?.dispose();

            if (currentMount && rendererRef.current?.domElement) {
                currentMount.removeChild(rendererRef.current.domElement);
            }

            // Clear refs
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            planesGroupRef.current = null;
            previewMeshRef.current = null;
            previewMaterialRef.current = null;
        };
    }, []); // Empty dependency array: runs once on mount and cleans up on unmount

    // --- Effect to Manage Preview Plane ---
    useEffect(() => {
        if (!planesGroupRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

        // Cleanup existing preview mesh if any
        if (previewMeshRef.current) {
            previewMeshRef.current.geometry?.dispose();
            if (Array.isArray(previewMeshRef.current.material)) {
                previewMeshRef.current.material.forEach(material => material.dispose());
            } else {
                previewMeshRef.current.material?.dispose();
            }

            // Dispose and clear material ref specifically
            previewMaterialRef.current?.dispose();
            previewMaterialRef.current = null;


            planesGroupRef.current.remove(previewMeshRef.current); // Remove from group
            previewMeshRef.current = null; // Clear mesh ref
        }

        // Create and add new preview mesh if clickedCoords is not null
        if (clickedCoords) {
            const geometry = new THREE.PlaneGeometry(newPlaneConfig.width, newPlaneConfig.height);
            const material = new THREE.MeshBasicMaterial({
                color: newPlaneConfig.color,
                transparent: true, // Enable transparency
                opacity: newPlaneConfig.opacity, // Set opacity
                side: THREE.DoubleSide // Render both sides
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(clickedCoords.x, clickedCoords.y, 0.01); // Slightly above Z=0 for visibility

            planesGroupRef.current.add(mesh);
            previewMeshRef.current = mesh; // Store ref to the new preview mesh
            previewMaterialRef.current = material; // Store ref to the new preview material

            // Re-render the scene
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        } else {
            // If clickedCoords became null, just ensure we render after cleanup
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }


    }, [clickedCoords, newPlaneConfig, rendererRef, sceneRef, cameraRef, planesGroupRef]); // Rerun when clickedCoords or newPlaneConfig changes


    // --- Effect to Render Permanent Planes List ---
    useEffect(() => {
        if (!planesGroupRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

        // Clear existing permanent planes from the group and dispose their resources
        // Only dispose meshes whose material is not the current preview material
        planesGroupRef.current.children.filter(child => child !== previewMeshRef.current).forEach(child => {
            if (child instanceof THREE.Mesh) {
                child.geometry?.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material?.dispose();
                }
            }
            planesGroupRef.current!.remove(child);
        });


        // Add new permanent planes based on the 'planes' state
        planes.forEach(planeData => {
            const geometry = new THREE.PlaneGeometry(planeData.width, planeData.height);
            const material = new THREE.MeshBasicMaterial({
                color: planeData.color,
                transparent: true, // Needs to be transparent
                opacity: planeData.opacity, // Use plane's opacity
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(planeData.x, planeData.y, 0); // Render on the Z=0 plane

            planesGroupRef.current!.add(mesh);
        });

        // Re-render the scene after updating permanent planes
        rendererRef.current.render(sceneRef.current, cameraRef.current);

    }, [planes, rendererRef, sceneRef, cameraRef, planesGroupRef, previewMeshRef]); // Rerun this effect whenever the 'planes' state changes

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
        // Clearing clickedCoords will trigger the effect to remove the preview mesh
        setClickedCoords(null);
    };

    const handleClearPlanes = () => {
        setPlanes([]);
        // Clearing clickedCoords will trigger the effect to remove the preview mesh
        setClickedCoords(null);
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
                    className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded-full hover:bg-gray-600 transition z-10" // z-10 to ensure it's clickable
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1 h-10" // Increased height for color swatch
                            />
                        </div>
                        <div>
                            <label htmlFor="opacity" className="block text-sm font-medium">Opacity ({newPlaneConfig.opacity}):</label>
                            <input
                                type="range" // Range slider for opacity
                                id="opacity"
                                name="opacity"
                                value={newPlaneConfig.opacity}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                max="1"
                                className="mt-1 block w-full"
                            />
                        </div>

                        {/* Display clicked coordinates */}
                        <div className="text-sm">
                            Clicked Pos: {clickedCoords ? `X: ${clickedCoords.x.toFixed(2)}, Y: ${clickedCoords.y.toFixed(2)}` : 'Click on canvas'}
                        </div>

                        {/* Preview Color Swatch */}
                        <div className="w-full h-8 rounded-md border border-gray-600" style={{ backgroundColor: previewRgbaColor }}>
                            {/* Visual representation of the configured color and opacity */}
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