import { Children, useRef } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import FortuneTellerAnimation from './FortuneTellerAnimation'

gsap.registerPlugin(ScrollToPlugin)


function ScrollScreen() {
  const screenRef = useRef(1); // 记录当前屏幕索引

  const nextScreen = () => {
    console.log(screenRef.current)
    if (screenRef.current >= 3) return;
    const nextScreenY = window.innerHeight * screenRef.current;
    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: nextScreenY, autoKill: false },
      ease: "power3.inOut"
    });
    screenRef.current = (screenRef.current + 1); // 假设有3个屏幕
  };

  return (
    <div className="flex flex-col">
      {screenRef.current >= 1 && <Part nextScreen={nextScreen}>
        <Part1 />
      </Part>}
      {screenRef.current >= 1 && <Part nextScreen={nextScreen}>
        <Part2 />
      </Part>}
      {screenRef.current >= 1 && <Part nextScreen={nextScreen}>
        <Part1></Part1>
      </Part>}
    </div>
  );
}

export default ScrollScreen

function Part({ nextScreen = () => { console.log("nextScreen not set") }, children }) {
  return (<div className='h-[100vh] w-full flex flex-col'>
    <div className="h-16 bg-gray-100 text-white">顶部固定区域</div>
    <div className='flex flex-1 justify-center items-center border-dashed border-2 border-gray-500 p-4' onClick={nextScreen}>
      {children}
    </div>
  </div>)
}

function Part1({ nextScreen = () => { console.log("nextScreen not set") } }) {
  return <svg className="card" width="1280" height="540">
    <foreignObject width="100%" height="100%">
      <img
        src="https://upload.moonchan.xyz/api/01LLWEUU7E4JS5DNDPOJBKMLV73FJOKTD4/town.jpg"
        style={{ width: "100%", height: "100%", opacity: 0.7 }}
        alt="Background"
      />
    </foreignObject>
    {/* 白色椭圆背景 */}
    <ellipse
      cx="50%" cy="50%"
      rx="220" ry="80"
      fill="white"
      stroke="#fff  "
      strokeWidth="2"
      filter="url(#blur_filter)"
    />
    {/* 居中文字 */}
    <text
      x="50%" y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="32"
      fontWeight="bold"
      fill="#2d3748"
    >
      你发现了一间占卜屋
    </text>
    <g className='hover:cursor-pointer' onClick={nextScreen}>
      <rect
        x="40%"
        y="75%"
        width="20%"
        height="10%"
        fill='#fff'
        opacity={0.8}
        string={"2px solid #000"}
      />
      {/* 居中文字 */}
      <text
        x="50%" y="80%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="32"
        fontWeight="bold"
        fill="#2d3748"
      >
        点击进入
      </text>
    </g>
  </svg>
}
function Part2({ nextScreen = () => { console.log("nextScreen not set") } }) {
  return <svg className="card" width="1280" height="540">
    <foreignObject width="100%" height="100%">
      <img
        src="https://upload.moonchan.xyz/api/01LLWEUU7E4JS5DNDPOJBKMLV73FJOKTD4/town.jpg"
        style={{ width: "100%", height: "100%", opacity: 0.7 }}
        alt="Background"
      />
    </foreignObject>
    {/* 白色椭圆背景 */}
    <ellipse
      cx="50%" cy="50%"
      rx="220" ry="80"
      fill="white"
      stroke="#fff  "
      strokeWidth="2"
      filter="url(#blur_filter)"
    />
    {/* 居中文字 */}
    <text
      x="50%" y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="32"
      fontWeight="bold"
      fill="#2d3748"
    >
      你发现了一间占卜屋
    </text>
    <g className='hover:cursor-pointer' onClick={nextScreen}>
      <rect
        x="40%"
        y="75%"
        width="20%"
        height="10%"
        fill='#fff'
        opacity={0.8}
        string={"2px solid #000"}
      />
      {/* 居中文字 */}
      <text
        x="50%" y="80%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="32"
        fontWeight="bold"
        fill="#2d3748"
      >
        点击进入
      </text>
    </g>
  </svg>
}