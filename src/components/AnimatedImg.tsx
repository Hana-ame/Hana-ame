import { useRef, type MouseEvent } from 'react';

export default function AnimatedImg({ src = "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGltZ3xlbnwwfHx8fDE2OTY5NzE1NTg&ixlib=rb-4.0.3&q=80&w=1080", alt = "Image" }: { src?: string, alt?: string }) {

    const characterRef = useRef<HTMLImageElement>(null);
    const sensitivity = 45; // 视角灵敏度系数

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const target = characterRef.current;
        if (!target) return;

        // 获取元素边界信息
        const rect = target.getBoundingClientRect();

        // 计算标准化坐标（含灵敏度系数）
        const rawX = (e.clientX - rect.left) / rect.width;
        const rawY = (e.clientY - rect.top) / rect.height;
        const x = (rawX - 0.5) * sensitivity;
        const y = (0.5 - rawY) * sensitivity; // 反转Y轴方向

        // 动态变换公式（包含边界保护）
        const rotateY = Math.min(Math.max(x, -45), 45);
        const rotateX = Math.min(Math.max(y, -45), 45);
        target.style.transform = `
        rotateY(${rotateY}deg)
        rotateX(${rotateX}deg)
        scale(1.05)
        translateZ(30px)
      `;

        // 动态透明度计算（带衰减系数）
        const distance = Math.sqrt(x ** 2 + y ** 2);
        target.style.opacity = `${0.7 + Math.min(distance / 100, 0.3)}`;
    };

    // // 事件监听与清理
    // useEffect(() => {
    //     const element = characterRef.current;
    //     if (!element) return;

    //     element.addEventListener('mousemove', handleMouseMove);
    //     return () => element.removeEventListener('mousemove', handleMouseMove);
    // }, []);

    // 类型化事件处理器
    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        const element = e.currentTarget;

        // 应用过渡和重置动画
        element.style.transition = `
      transform 0.6s cubic-bezier(0.68, 0.1, 0.27, 1.55),
      opacity 0.3s ease-out
    `;
        element.style.transform = `
      rotateY(0deg)
      rotateX(0deg)
      scale(1)
      translateZ(0)
    `;
        element.style.opacity = '1';

        // 定时器清理机制
        const transitionTimer = setTimeout(() => {
            element.style.transition = '';
        }, 600);

        // 组件卸载时自动清理
        return () => clearTimeout(transitionTimer);
    };


    return (
        <img
            ref={characterRef}
            className="character"
            style={{
                width: '200px',
                height: '200px',
                background: '#3498db',
                transition: 'transform 0.3s, opacity 0.3s', // 平滑过渡[7,8](@ref)
                transformStyle: 'preserve-3d' // 启用3D变换上下文[9](@ref)
            }}
            src={src}
            alt={alt}
            onMouseOut={handleMouseLeave}
            onMouseMove={handleMouseMove}
        />  
    );
};
