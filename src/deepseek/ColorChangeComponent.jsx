import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const ColorChangeComponent = () => {
  const [elementRef, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={elementRef}
      className={`h-32 w-32 transition-colors duration-1500 ${
        isVisible ? 'bg-blue-500' : 'bg-red-500'
      }`}
    >
      {isVisible ? '已进入视口' : '等待触发'}
    </div>
  );
};

export default ColorChangeComponent;