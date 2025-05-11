import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react'; // Recommended for React integration

gsap.registerPlugin(useGSAP); // Not strictly necessary if using <GsapReactProvider> or if already registered globally

const FlipCard3D = ({
  frontColor = 'royalblue',
  backColor = 'lightcoral',
  width = 200,
  height = 300,
  duration = 0.7,
}) => {
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

  return (
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
        <span style={{ color: 'white', fontSize: '20px' }}>Front</span>
      </div>
      <div style={backFaceStyle}>
        {/* Content for the back face */}
        <span style={{ color: 'white', fontSize: '20px' }}>Back</span>
      </div>
    </div>
  );
};

// Example Usage:
const App = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0', gap: '30px' }}>
      <FlipCard3D frontColor="dodgerblue" backColor="tomato" />
      <FlipCard3D frontColor="#2ecc71" backColor="#f39c12" width={150} height={200} duration={1} />
    </div>
  );
};

export default FlipCard3D; // Or export FlipCard3D if used elsewhere