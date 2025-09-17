// ThreeSceneContainer.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

interface ThreeSceneContainerProps {
    /**
     * A callback function that will be invoked after the basic Three.js scene is set up.
     * It receives the THREE.Scene instance as an argument, allowing you to add
     * objects, lights, etc., to the scene.
     * It can optionally return a cleanup function that will be called when the component unmounts
     * or when this callback itself changes.
     */
    onSceneReady: (scene: THREE.Scene) => (() => void) | void;
    width?: string;
    height?: string;
    cameraPositionZ?: number;
    backgroundColor?: THREE.ColorRepresentation;
}

const ThreeSceneContainer: React.FC<ThreeSceneContainerProps> = ({
    onSceneReady,
    width = '100%',
    height = '600px',
    cameraPositionZ = 5,
    backgroundColor = 0x282c34,
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Using PerspectiveCamera for more general use
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const userCleanupRef = useRef<(() => void) | null>(null); // To store cleanup from onSceneReady

    const handleResize = useCallback(() => {
        if (cameraRef.current && rendererRef.current && mountRef.current) {
            const newWidth = mountRef.current.clientWidth;
            const newHeight = mountRef.current.clientHeight;

            cameraRef.current.aspect = newWidth / newHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newWidth, newHeight);
        }
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // 1. Scene
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(backgroundColor);

        // 2. Camera (Perspective)
        cameraRef.current = new THREE.PerspectiveCamera(
            75, // fov
            currentMount.clientWidth / currentMount.clientHeight, // aspect
            0.1, // near
            1000 // far
        );
        cameraRef.current.position.z = cameraPositionZ;

        // 3. Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(rendererRef.current.domElement);

        // 4. Call the user's setup function
        if (sceneRef.current) {
            const cleanupFromCallback = onSceneReady(sceneRef.current);
            if (typeof cleanupFromCallback === 'function') {
                userCleanupRef.current = cleanupFromCallback;
            }
        }

        // 5. Animation Loop
        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            // You might want to add a callback here too for custom animations
            // e.g., onAnimate(scene, camera);
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        // 6. Handle Resize
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        // 7. Cleanup
        return () => {
            console.log("Cleaning up ThreeSceneContainer");
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            window.removeEventListener('resize', handleResize);

            // Call user-provided cleanup first
            if (userCleanupRef.current) {
                console.log("Running user cleanup from onSceneReady");
                userCleanupRef.current();
                userCleanupRef.current = null;
            }

            // Dispose of objects added by the user if not handled by userCleanup
            // This is a basic attempt; robust cleanup might require the user to handle it.
            if (sceneRef.current) {
                while(sceneRef.current.children.length > 0){
                    const object = sceneRef.current.children[0];
                    sceneRef.current.remove(object);

                    if (object instanceof THREE.Mesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                           if (Array.isArray(object.material)) {
                               object.material.forEach(material => material.dispose());
                           } else {
                               (object.material as THREE.Material).dispose();
                           }
                        }
                    }
                    // Add more specific disposals if needed (lights, helpers, etc.)
                }
            }


            if (rendererRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                currentMount.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }

            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
        };
    }, [onSceneReady, cameraPositionZ, backgroundColor, handleResize]); // Re-run if onSceneReady changes

    return <div ref={mountRef} style={{ width, height, border: '1px solid lightgray' }} />;
};

export default ThreeSceneContainer;
