import React, { useRef, useEffect } from 'react';
import { gsap, Power2 } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FortuneTellerAnimation = () => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const timelineRef = useRef(gsap.timeline({ paused: true })); // Create paused timeline

  useEffect(() => {
    const tl = timelineRef.current;

    // Define SVG and elements.  Use refs for direct access.
    const svg = svgRef.current;
    const text = textRef.current;
    const button = buttonRef.current;

    // Early exit if refs aren't yet defined
    if (!svg || !text || !button) return;

    // Set initial states.  Important for resets and initial render.
    gsap.set([text, button], { opacity: 0 });

    // Animate the "fortune teller house" appearance.  Simulate blurry background.
    tl.fromTo(
      svg,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.5,
        ease: Power2.easeInOut
      }
    )
    .add(() => {
      // Show text after a delay
      gsap.to(text, {
        opacity: 1,
        duration: 0.7,
        y: 0,  //Ensure starting position is correct if using yPercent
        ease: Power2.easeOut,
      });
    }, "+=1.5") // Delay before showing text

    .add(() => {
      // Animate button appearance
      gsap.to(button, {
        opacity: 1,
        duration: 0.5,
        ease: Power2.easeOut,
      });
    }, "+=0.75"); // Delay before showing the button

    // Create ScrollTrigger
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom+=100',  //Trigger when the top of the container hits the bottom of the viewport minus 100px. Adjust as needed.
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.pause(0), // Reset on scroll up
      onEnterBack: () => tl.play(),
      once: false,  // Play again if scrolled back into view
      markers: false, // Helpful for debugging scroll trigger positions
    });

    // Cleanup scrolltrigger on unmount.  Essential!
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };

  }, []); // Empty dependency array means this runs only on mount/unmount


  const svgStyle = {
    width: '100%',
    height: 'auto',
    maxWidth: '800px', // Adjust for your layout.
    display: 'block',
    margin: '0 auto'
  };

  const buttonStyle = {
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid black',
    padding: '10px 20px',
    cursor: 'pointer',
    marginTop: '20px',
    textAlign: 'center',
    width: 'fit-content',
    margin: '20px auto',
    borderRadius: '5px'
  };

  const textStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' // Add text shadow for better readability
  };


  return (
    <div ref={containerRef} style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' }}>
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          style={svgStyle}
          viewBox="0 0 800 600" // Adjust to your image's aspect ratio
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <defs>
            {/* Define the blur filter */}
            <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" /> {/* Adjust stdDeviation for blur intensity */}
            </filter>
          </defs>

          {/* Background Image */}
          <image width="800" height="600" xlinkHref="your-image.jpg" style={{ filter: 'brightness(0.8)' }} /> {/* Replace with your image path */}

          {/* Blurred Ellipse */}
          <ellipse
            cx="400"  // Center X
            cy="300"  // Center Y
            rx="200"  // X Radius (half the image width - adjust as needed)
            ry="150"  // Y Radius (half the image height - adjust as needed)
            fill="rgba(0, 0, 0, 0.2)" // Semi-transparent fill for the blur effect to be visible
            filter="url(#blurFilter)" // Apply the blur filter
          />
        </svg>

        <div ref={textRef} style={{ ...textStyle, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, y: -20 }}>
          你发现了一处占卜屋
        </div>

        <div ref={buttonRef} style={buttonStyle}>
          进去看看
        </div>
      </div>
    </div>
  );
};

export default FortuneTellerAnimation;