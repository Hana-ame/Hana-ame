import React, { useEffect, useRef } from 'react';
import CanvasManager from '../Tools/canvas/canvasmanager.ts';
import AVDManager from './AVDManager.ts';

const CanvasComponent = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null); // 用于获得界面大小
    const canvasManagerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;

        // 获取父元素的宽度
        const containerWidth = container.offsetWidth;
        const aspectRatio = 16 / 8; // 16:10 比例
        const canvasWidth = containerWidth;
        const canvasHeight = canvasWidth / aspectRatio;

        // 初始化 CanvasManager
        const canvasManager = new AVDManager(canvasRef.current, 1000, 500);
        canvasManager.setSize(canvasWidth, canvasHeight);
        canvasManager.drawBackground(); // 绘制背景

        // 将 CanvasManager 保存到 ref
        canvasManagerRef.current = canvasManager;

        // 滚动到 container 元素的位置
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

        function test() {
            const m = canvasManager;
            const src = "https://proxy.moonchan.xyz/bfs/archive/942752679f58223257855b4d8ed0299ee5c71904.jpg?proxy_host=i0.hdslb.com";
            // m.loadImage("https://proxy.moonchan.xyz/bfs/archive/942752679f58223257855b4d8ed0299ee5c71904.jpg?proxy_host=i0.hdslb.com", 200, 100);

            // 加载并绘制图像
            const img = new Image();
            img.src = src;

            img.onload = () => {
                m.drawImage(img, 200, 100, 800, 600,);
                m.drawImage(img, 300, 150, 900, 650,);
                m.drawImageSlice(img, 400, 400, 500, 500, 1600, 150, 200, 300,);
                m.drawImageSlice(img, 800, 400, 500, 500, 1800, 300, 200, 300,);
            };

            img.onerror = (error) => {
                console.error("Image load error:", error);
            };


            const ctx = m.getContext();

            ctx.font = 'bold 50px Consolas'; // 设置字体大小和字体类型

            //     // ctx.scale(2, 2); // 将绘制区域在 x 和 y 方向上都缩放 2 倍
            //     ctx.fillText('Hello, Canvas!啊啊', 50, 50); // 这里的坐标会被缩放
            //     // ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换

            //     // ctx.scale(1, 1); // 将绘制区域在 x 和 y 方向上都缩放 2 倍
            //     ctx.fillText(
            //         'Visual Studio Code（VSCode）的默认字体是 "Courier New"，但用户可以根据个人喜好在设置中更改字体。常见的编程字体还包括 "Fira Code"、"Consolas"、"Monaco" 和 "Source Code Pro" 等。你可以在 VSCode 的设置中找到字体选项，进行自定义设置。',
            //          250, 100); // 这里的坐标会被缩放
            //     // ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换

            const [xx, yy] = m.drawText(
                "123456789012345678901234567890123456789012345678901234567890123456789\r\nq0123456789012345678901234567890"
                , 50, 50, 500, "white")
            m.drawPoint(xx, yy)

            m.initImages({
                'background': 'https://upload.moonchan.xyz/api/01LLWEUU2LRX4IM56ORJFIBC3OE3YTMPN7/bg000.jpg',
                'dialogueBox': 'https://upload.moonchan.xyz/api/01LLWEUU7LESNYUQKX5VDJGMVDZY3SRS7I/main_gallery.png',
            })
            m.initDialogue([
                {
                    name:"a",
                    text:"测试",
                },{
                    name:"a",
                    text:"123",
                },{
                    name:"a",
                    text:"321",
                },{
                    name:"a",
                    text:"测试测试测试测试",
                },{
                    name:"a",
                    text:"3111",
                }
            ])

            setTimeout(() => {
                m.initInput();
            }, 1000)
        }

        test()

    }, []);

    return (
        <div className="flex flex-col h-screen bg-black w-full" ref={containerRef}>
            {/* 画布区域 */}
            <div className="flex-grow flex justify-center items-center">
                <canvas ref={canvasRef} className="border border-black" />
            </div>
        </div>
    );
};

export default CanvasComponent;