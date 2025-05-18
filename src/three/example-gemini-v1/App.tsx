
// App.tsx (or any parent component)
import React, { useCallback, useRef } from 'react';
import * as THREE from 'three';
import ThreeSceneContainer from '../ThreeSceneContainer'; // Adjust path

const App: React.FC = () => {
    const cubeRef = useRef<THREE.Mesh | null>(null);

    // This is our callback function that will populate the scene
    const setupMyScene = useCallback((scene: THREE.Scene): (() => void) => {
        console.log("setupMyScene called, scene:", scene);

        // Add a light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(2, 3, 4);
        scene.add(pointLight);

        // Add a cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x007bff }); // Blue
        cubeRef.current = new THREE.Mesh(geometry, material);
        scene.add(cubeRef.current);

        // Start a simple animation for the cube added by this callback
        let animationId: number;
        const animateCube = () => {
            animationId = requestAnimationFrame(animateCube);
            if (cubeRef.current) {
                cubeRef.current.rotation.x += 0.005;
                cubeRef.current.rotation.y += 0.007;
            }
        };
        animateCube();


        // Return a cleanup function specific to what was added here
        return () => {
            console.log("Cleaning up objects from setupMyScene");
            if (animationId) cancelAnimationFrame(animationId);
            if (cubeRef.current) {
                scene.remove(cubeRef.current); // Important: remove from scene
                cubeRef.current.geometry.dispose();
                (cubeRef.current.material as THREE.Material).dispose();
                cubeRef.current = null;
                console.log("Cube disposed");
            }
            scene.remove(ambientLight);
            scene.remove(pointLight);
            // No need to dispose lights, they don't hold GPU resources like geometry/material
            console.log("Lights removed");
        };
    }, []); // Empty dependency array means this callback itself won't change unless component re-mounts


    const setupAnotherScene = useCallback((scene: THREE.Scene) => {
        const sphereGeo = new THREE.SphereGeometry(0.8, 32, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.x = -2;
        scene.add(sphere);
        // No cleanup function returned, ThreeSceneContainer will try generic cleanup
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <h1>Scene 1: My Custom Cube (with specific cleanup)</h1>
            <ThreeSceneContainer onSceneReady={setupMyScene} height="400px" />

            <h1>Scene 2: Another Scene (generic cleanup)</h1>
            <ThreeSceneContainer onSceneReady={setupAnotherScene} height="300px" backgroundColor={0x333333} />
        </div>
    );
};

export default App;