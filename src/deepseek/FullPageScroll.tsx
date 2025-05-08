import React, { useRef, useEffect } from 'react';
import './styles.css'; // 确保 CSS 类型声明正确（如需要可添加 .d.ts 文件）
import ColorChangeComponent from './ColorChangeComponent.jsx'; // 确保路径正确

// 能用的，但是有点怪。


const FullPageScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentIndex = useRef<number>(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const current = containerRef.current;
      // 严格 null 检查
      if (!current) return;

      // 类型安全的滚动方向计算
      const delta = e.deltaY > 0 ? 1 : -1;
      const maxIndex = current.children.length - 1;

      // 索引边界保护
      currentIndex.current = Math.max(
        0,
        Math.min(currentIndex.current + delta, maxIndex)
      );

      // 类型断言确保 children 是 HTMLElement[]
      const targetElement = current.children[
        currentIndex.current
      ] as HTMLElement;

      // 安全滚动操作
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const current = containerRef.current;
    // 严格 DOM 元素存在性检查
    if (current) {
      // 明确事件监听器类型
      current.addEventListener('wheel', handleWheel as EventListener, {
        passive: false
      });
    }

    return () => {
      if (current) {
        current.removeEventListener('wheel', handleWheel as EventListener);
      }
    };
  }, []);

  return (
    <div className="scroll-container" ref={containerRef}>
      <ColorChangeComponent></ColorChangeComponent>
      <div className="screen" style={{ background: '#FF6B6B' }}>Section 1</div>
      <ColorChangeComponent></ColorChangeComponent>
      <div className="screen" style={{ background: '#4ECDC4' }}>Section 2</div>
      <ColorChangeComponent></ColorChangeComponent>
      <div className="screen" style={{ background: '#45B7D1' }}>Section 3</div>
    </div>
  );
};

export default FullPageScroll;