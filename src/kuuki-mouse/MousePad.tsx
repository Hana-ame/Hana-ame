import React, { useRef, useEffect } from 'react';

interface MousePadProps {
//   onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
//   onMouseUp?: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  onMouseDown?: (e: string) => void;
  onMouseUp?: (e: string) => void;
}

export default function MousePad({ onMouseDown, onMouseUp }: MousePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 初始化画布并设置坐标系原点为左下角
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 保存初始状态
    ctx.save();

    // 移动原点：将原点从左上角移动到左下角
    // 注意：这也会反转Y轴的方向（向上为正，向下为负）
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    // 设置画布背景色（在转换后的坐标系下绘制）
    // ctx.fillStyle = '#f0f0f0'; // 浅灰色背景
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制一个简单的参考线或点以示坐标方向
    // ctx.fillStyle = 'blue';
    // ctx.fillRect(10, 10, 5, 5); // 在靠近新原点（左下角）的位置画一个蓝色小方块

    // 注意：后续所有的绘图操作都将基于这个新的坐标系

    // 清理函数：组件卸载时恢复上下文状态（可选）
    return () => {
        ctx.restore();
    };
  }, []); // 空依赖数组确保effect只运行一次

  // 处理鼠标/触摸按下事件
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (onMouseDown) onMouseDown("left");
  };

  // 处理鼠标/触摸抬起事件
  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (onMouseUp) onMouseUp("left");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 p-4">
      <canvas
        ref={canvasRef}
        width={'680'}
        height={'720'}
        className="bg-white rounded-lg shadow-md border border-gray-200"
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        style={{ touchAction: 'none' }} // 防止触摸时的默认行为（如滚动）
      />
    </div>
  );
}