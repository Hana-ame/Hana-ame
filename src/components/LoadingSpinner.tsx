// 加载动画组件
const LoadingSpinner = () => (
    <div className="fixed top-0 left-0 w-full h-full bg-white/80 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
    </div>
);

export default LoadingSpinner;