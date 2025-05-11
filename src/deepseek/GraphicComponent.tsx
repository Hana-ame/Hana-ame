// GraphicComponent.tsx
// 测试动画效果用，不是很好用。
const GraphicComponent = () => (
    <svg width="400" height="400" viewBox="0 0 400 400">
        <Frame />
        <g transform="translate(80, 100)">
            <Cube />
            <Cube x={100} />
            <Cube x={200} />
        </g>
        <g transform="translate(30, 200)">
            <Cube />
            <Cube x={80} y={40} />
            <Cube x={160} y={80} />
        </g>
        <Star color="#4ECDC4" x={200} y={200} rotate={180}/>    
        <Star color="#4ECDC4" x={200} y={200} scale={2} rotate={180}/>    
        <Circle cx={200} cy={200}></Circle>
    </svg>
);

export default GraphicComponent;

interface CubeProps {
    x?: number;
    y?: number;
    frontColor?: string;
    topColor?: string;
    sideColor?: string;
}

const Cube = ({ x = 0, y = 0, frontColor = "#4ECDC4", topColor = "#45B7D1", sideColor = "#3A9E8F" }: CubeProps) => {
    return (
        <g transform={`translate(${x}, ${y})`}>
            <rect width="60" height="60" fill={frontColor} />
            <path d="M0 0 L30 -30 L90 -30 L60 0" fill={topColor} />
            <path d="M60 0 L90 -30 L90 30 L60 60" fill={sideColor} />
        </g>
    );
};

const Frame = () => (
    <rect
        x="50"
        y="50"
        width="300"
        height="300"
        fill="none"
        stroke="#333"
        strokeWidth="4"
    />
);

const Circle = ({ cx = 0, cy = 0, r = 10 }) => (
    <circle cx={cx} cy={cy} r={r} />
)

// 不能scale
const Star = ({color = "currentColor", scale = 1, rotate=0, x=0, y=0})  => (
    <path
          d="M50 5 
             L63.8 38.5 99 38.5 
             L69.1 59.2 82.3 92.5 
             L50 73.3 17.7 92.5 
             L30.9 59.2 1 38.5 
             L36.2 38.5 Z"
          stroke-linejoin="round" 
          stroke-width="2"
          fill={color}
          transform={`rotate(${rotate}, ${x}, ${y}) translate(${x-50}, ${y-50}) scale(${scale})`}
          
    />
)