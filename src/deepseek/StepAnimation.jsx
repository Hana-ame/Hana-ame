import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import FortuneTellerAnimation from './FortuneTellerAnimation'
import ScrollTrigger from 'gsap/ScrollTrigger'
import FlipCard3D from './FlipCard3D';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)


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
        <Part3 />
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
  const [container, isVisible] = useIntersectionObserver();
  const g = useRef(null);
  const tl = useRef(null);

  // 修复1: 声明依赖项，绑定正确作用域
  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true })
      .to(g.current, {
        opacity: 1,
        duration: 3,
        ease: "power2.out" // 添加缓动函数优化效果[3](@ref)
      });
  }, {
    scope: container,
    dependencies: [g.current]
  });

  // 修复2: 严格控制播放逻辑
  useEffect(() => {
    if (isVisible && tl.current) {
      tl.current.restart(); // 使用 restart 而非 play
    }
    return () => {
      if (tl.current) {
        tl.current.progress(0).pause(); // 重置动画状态
      }
    };
  }, [isVisible]);

  return <svg ref={container} className="card" width="1280" height="540">
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
    <g ref={g} className='hover:cursor-pointer' onClick={nextScreen}
      style={{ opacity: 0 }}>
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
  const [container, isVisible] = useIntersectionObserver();
  const g = useRef(null);
  const tl = useRef(null);

  // 修复1: 声明依赖项，绑定正确作用域
  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true })
      .to(g.current, {
        opacity: 1,
        duration: 3,
        ease: "power2.out" // 添加缓动函数优化效果[3](@ref)
      });
  }, {
    scope: container,
    dependencies: [g.current]
  });

  // 修复2: 严格控制播放逻辑
  useEffect(() => {
    if (isVisible && tl.current) {
      tl.current.restart(); // 使用 restart 而非 play
    }
    return () => {
      if (tl.current) {
        tl.current.progress(0).pause(); // 重置动画状态
      }
    };
  }, [isVisible]);

  return <svg ref={container} className="card" width="1280" height="540">
    <foreignObject width="100%" height="100%">
      <img
        src="https://upload.moonchan.xyz/api/01LLWEUU7TW5XYHN5J5ZA2MPJXCQAZJ4JM/desk.jpg"
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
      你来到了桌前，占卜师说：首先问你一些问题吧
    </text>
    <g ref={g} className='hover:cursor-pointer' onClick={nextScreen}
      style={{ opacity: 0 }}>
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
        （还没写，点击占卜抽卡）
      </text>
    </g>
  </svg>
}

function Part3({ nextScreen = () => { console.log("nextScreen not set") },
  frontColor = 'royalblue',
  backColor = 'lightcoral',
  width = 200,
  height = 300,
  duration = 0.7,
 }) {
  const cardRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // useGSAP hook for managing GSAP animations within React components  
  // This hook handles cleanup automatically.
  useGSAP(() => {
    // Set initial 3D properties for the flip effect
    // transformPerspective gives a more realistic 3D depth.
    // transformStyle: 'preserve-3d' is crucial for child elements to maintain 3D positioning.
    gsap.set(cardRef.current, {
      transformStyle: 'preserve-3d',
      transformPerspective: 1000, // Adjust for more or less perspective
    });

    // Set initial state for front and back faces
    // The back face is initially rotated 180 degrees on the Y-axis and hidden.
    // backfaceVisibility: 'hidden' prevents the back of an element from being visible
    // when it's facing away from the viewer (important for clean flips).
    gsap.set(cardRef.current.children[0], { backfaceVisibility: 'hidden' }); // Front face
    gsap.set(cardRef.current.children[1], {
      backfaceVisibility: 'hidden',
      rotationY: -180, // Start rotated to be the back
    });

  }, { scope: cardRef }); // Scope ensures GSAP targets elements within cardRef and cleans up

  const handleClick = () => {
    setIsFlipped(!isFlipped);

    gsap.to(cardRef.current, {
      rotationY: isFlipped ? 0 : -180, // Toggle rotation
      duration: duration,
      ease: 'power2.inOut', // Smooth easing
    });
  };

  const cardStyle = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'relative', // Needed for absolute positioning of faces
    cursor: 'pointer',
    // perspective: '1000px', // Can also be set on the parent of the card for a group effect
  };

  const faceStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10px', // Optional: for rounded corners
    WebkitBackfaceVisibility: 'hidden', // Safari
    backfaceVisibility: 'hidden', // Standard
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Optional: subtle shadow
  };

  const frontFaceStyle = {
    ...faceStyle,
    backgroundColor: frontColor,
    zIndex: 2, // Ensure front is initially above back (though rotation handles visibility)
  };

  const backFaceStyle = {
    ...faceStyle,
    backgroundColor: backColor,
    transform: 'rotateY(180deg)', // Initially rotated to be the back (GSAP will override this during setup)
  };
  
  
  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Ensures image covers the area, might crop
    // objectFit: 'contain', // Ensures image is fully visible, might leave empty space
    display: 'block', // Removes extra space below inline images
  };

  return (<>
    <div
      ref={cardRef}
      style={cardStyle}
      onClick={handleClick}
      role="button" // Accessibility
      tabIndex={0}  // Accessibility
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }} // Accessibility
    >
      <div style={frontFaceStyle}>
        {/* Content for the front face */}
        {/* <span style={{ color: 'white', fontSize: '20px' }}>Front</span> */}
        <img src={"https://upload.moonchan.xyz/api/01LLWEUU7BJCHEKTZWDBG2R2BTPOWNEDEP/image.png"} alt={"cover"} style={imageStyle} />

      </div>
      <div style={backFaceStyle}>
        {/* Content for the back face */}
        <span style={{ color: 'white', fontSize: '20px' }}>卡名</span>
      </div>
    </div>
    （解说词占位符）
    <br />
    （解说词占位符）
    （解说词占位符）
    （解说词占位符）
    （解说词占位符）
    （解说词占位符）
    （解说词占位符）
    （解说词占位符）

  </>
  );
}