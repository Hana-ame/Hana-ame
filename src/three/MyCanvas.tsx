import { useEffect, useRef } from "react";
import * as THREE from 'three';

export default function Canvas({
    width = '100vw',
    height = '100vh',
    frustumSize = 100,
    sceneGetter,
    onClick,
    onResize,
}: {
    width: string,
    height: string,
    frustumSize: number,
    sceneGetter: () => THREE.Scene | null,
    onClick: ({ x, y }: { x: number, y: number }) => void
    onResize: ({ x, y }: { x: number, y: number }) => void
}) {
    // console.log("CANVAS RELOADED")

    const mountRef = useRef<HTMLDivElement>(null);
    // const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    // useEffect(() => {
    //     console.log("frustumSize")
    // }, [frustumSize])
    // useEffect(() => {
    //     console.log("onClick")
    // }, [onClick])
    // useEffect(() => {
    //     console.log("onResize")
    // }, [onResize])
    // useEffect(() => {
    //     console.log("sceneGetter")
    // }, [sceneGetter])




    // setup
    useEffect(() => {
        if (!mountRef.current) return;

        // 拿到框的真实大小，描边了1px还要各-2px
        const currentMount = mountRef.current;
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;

        // sceneRef.current = new THREE.Scene();
        // sceneRef.current.background = new THREE.Color(0xaaaaaa); // 这是之前的灰色

        // Orthographic Camera
        const aspect = width / height;
        // const frustumSize = 100; // 这里的意思是y轴[-5,5]
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

        // 创建出来的canvas DOM
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio); // 为什么是这样。
        currentMount.appendChild(rendererRef.current.domElement);



        // Animation Loop (minimal, just for rendering)
        const animate = () => {

            window.requestAnimationFrame(animate);
            if (rendererRef.current && sceneGetter && cameraRef.current) {

                const nextScene = sceneGetter();
                if (!nextScene) return;

                rendererRef.current.render(nextScene, cameraRef.current);
            }
        };
        // Initial render
        animate();


        // 处理Resize，其实比较分离。
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

                onResize({ x: newWidth, y: newHeight })

                rendererRef.current.setSize(newWidth, newHeight);
                const nextScene = sceneGetter();
                if (nextScene) rendererRef.current.render(nextScene, cameraRef.current); // Re-render after resize
            }
        };
        window.addEventListener('resize', handleResize);

        // --- Canvas Click Handling ---
        const handleCanvasClick = (event: MouseEvent) => {
            if (!cameraRef.current || !currentMount) return;

            const rect = currentMount.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // 转换为平面直角坐标系
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
            // setClickedCoords({ x: vector.x, y: vector.y });
            // console.log(`Clicked World Coords: X=${vector.x.toFixed(2)}, Y=${vector.y.toFixed(2)}`);
            onClick({ x: vector.x, y: vector.y })
            // Note: The preview mesh is handled by a separate effect triggered by setClickedCoords
        };
        currentMount.addEventListener('click', handleCanvasClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            currentMount.removeEventListener('click', handleCanvasClick);

            rendererRef.current?.dispose();

            if (currentMount && rendererRef.current?.domElement) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            // Clear refs
            // sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
        };
    }, [])

    return <div ref={mountRef} style={{ width, height, border: '1px solid lightgray' }} />;
}