import { useCallback, useEffect, useRef, useState } from "react";
import MyCanvas from "../MyCanvas"; // Assuming this path is correct
import * as THREE from 'three';

export default function App() {
    // console.log("APP RELOADED");

    const sceneRef = useRef<THREE.Scene | null>(null);
    const [bg, setBG] = useState(0xaaaaaa); // Initial gray background
    const [cord, setCord] = useState({ x: 0, y: 0, z: 0 }); // Added z for clarity
    const meshRef = useRef<THREE.Mesh | null>(null); // For the heart mesh

    // Effect 1: Scene setup and background color
    useEffect(() => {
        // console.log("APP EFFECT: Scene Setup triggered by bg change");
        const newScene = new THREE.Scene();
        newScene.background = new THREE.Color(bg);
        sceneRef.current = newScene;

        // If heart mesh already exists, add it to the new scene
        if (meshRef.current) {
            // console.log("APP EFFECT: Adding existing heart mesh to new scene");
            sceneRef.current.add(meshRef.current);
        }

        return () => {
            // console.log("APP EFFECT: Scene Cleanup (bg changed or unmount)");
            // When the scene is about to be replaced or component unmounts,
            // clean up by removing objects.
            // The actual disposal of the scene object itself is handled by JS garbage collection
            // once sceneRef.current is reassigned or the component unmounts.
            if (sceneRef.current && meshRef.current && sceneRef.current.children.includes(meshRef.current)) {
                sceneRef.current.remove(meshRef.current);
            }
            // No need to explicitly set sceneRef.current = null here,
            // as it's either reassigned or the component is unmounting.
        };
    }, [bg]); // Re-run this effect if 'bg' changes

    // Effect 2: Create the heart mesh (runs once on mount)
    useEffect(() => {
        // console.log("APP EFFECT: Heart Mesh Creation (runs once)");
        const heartShape = new THREE.Shape();
        const x = 0, y = 0; // Center of the heart shape
        // Scale down the heart a bit to make movement more visible if it's large
        const s = 0.5; // Scale factor

        heartShape.moveTo(x + 5 * s, y + 5 * s);
        heartShape.bezierCurveTo(x + 5 * s, y + 5 * s, x + 4 * s, y, x, y);
        heartShape.bezierCurveTo(x - 6 * s, y, x - 6 * s, y + 7 * s, x - 6 * s, y + 7 * s);
        heartShape.bezierCurveTo(x - 6 * s, y + 11 * s, x - 3 * s, y + 15.4 * s, x + 5 * s, y + 19 * s);
        heartShape.bezierCurveTo(x + 12 * s, y + 15.4 * s, x + 16 * s, y + 11 * s, x + 16 * s, y + 7 * s);
        heartShape.bezierCurveTo(x + 16 * s, y + 7 * s, x + 16 * s, y, x + 10 * s, y);
        heartShape.bezierCurveTo(x + 7 * s, y, x + 5 * s, y + 5 * s, x + 5 * s, y + 5 * s);

        const geometry = new THREE.ShapeGeometry(heartShape);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red heart
        const heartMesh = new THREE.Mesh(geometry, material);

        // Set initial position from state
        heartMesh.position.set(cord.x, cord.y, cord.z);
        meshRef.current = heartMesh;

        // Add to scene if scene already exists
        if (sceneRef.current) {
            // console.log("APP EFFECT: Adding newly created heart mesh to existing scene");
            sceneRef.current.add(meshRef.current);
        }

        return () => {
            // console.log("APP EFFECT: Heart Mesh Cleanup (on unmount)");
            if (sceneRef.current && meshRef.current && sceneRef.current.children.includes(meshRef.current)) {
                sceneRef.current.remove(meshRef.current);
            }
            geometry.dispose();
            material.dispose();
            meshRef.current = null;
        };
    }, []); // Empty dependency array: runs once on mount and cleans up on unmount

    // Effect 3: Update heart mesh position when `cord` state changes
    useEffect(() => {
        if (meshRef.current) {
            // console.log("APP EFFECT: Updating heart position to", cord);
            meshRef.current.position.set(cord.x, cord.y, cord.z);
        }
    }, [cord]); // Re-run this effect if 'cord' changes

    // Callback to get the current scene for MyCanvas
    const getScene = useCallback(() => {
        return sceneRef.current;
    }, []); // sceneRef itself doesn't change, its .current property does.
    // MyCanvas probably just needs a function that returns the scene.

    const handleClick = useCallback(() => {
        // console.log("Button/Canvas Clicked");
        // Example: Move heart up and slightly to the right on each click
        setCord(prevCord => ({
            x: prevCord.x + 2, // Move right by 2 units
            y: prevCord.y + 2, // Move up by 2 units
            z: prevCord.z       // Z position remains the same
        }));

        // Example: Change background color on click too, to test scene recreation
        // setBG(prevBg => (prevBg === 0xaaaaaa ? 0xbbbbbb : 0xaaaaaa));
    }, [])


    const dummy = useCallback(({ x, y }: { x: number, y: number }) => {

    }, [])



    return <MyCanvas
        width="100vw"
        height="100vh"
        frustumSize={100}
        sceneGetter={getScene}
        onClick={handleClick}
        onResize={dummy} />;
    // Changed prop name to sceneGetter to reflect it's a function
    // If MyCanvas expects the scene object directly, adjust accordingly.
    // If MyCanvas expects `scene={sceneRef.current}` and handles updates itself, that's also an option.
    // The `useCallback` for `getScene` is good if `MyCanvas` uses it in its own effect dependencies.
}