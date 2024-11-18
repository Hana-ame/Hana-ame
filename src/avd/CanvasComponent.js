import React, { useEffect, useRef } from 'react';

const CanvasComponent = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const container = containerRef.current;

        // 获取父元素的宽度
        const containerWidth = container.offsetWidth;
        const aspectRatio = 16 / 8;

        // 计算 canvas 的宽度和高度
        const canvasWidth = containerWidth;
        const canvasHeight = canvasWidth / aspectRatio;

        // 设置 canvas 的宽度和高度
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 可选：在 canvas 上绘制内容
        context.fillStyle = 'lightblue';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    }, []);

    return (
        <div className="flex flex-col h-screen" ref={containerRef}>
            {/* 画布区域 */}
            <div className="flex-grow flex justify-center items-center">
                <canvas ref={canvasRef} className="border border-black" />
            </div>
        </div>
    );
};

export default CanvasComponent;