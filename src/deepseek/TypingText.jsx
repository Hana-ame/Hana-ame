import React, { useState, useEffect, useRef } from 'react';

/**
 * A React component that displays text with a typing animation.
 * Characters appear one by one from left to right.
 *
 * @param {object} props - The component's props.
 * @param {string} props.text - The full text to be displayed.
 * @param {number} [props.speed=50] - The speed of typing in milliseconds per character.
 * @param {function} [props.onTypingComplete] - Callback function called when typing is finished.
 * @param {object} [props.containerProps] - Optional props to apply to the wrapping element (e.g., className, style).
 */
function TypingText({ text, speed = 50, onTypingComplete, containerProps = {} }) {
    // State to keep track of how many characters should be displayed
    const [displayedCharCount, setDisplayedCharCount] = useState(0);

    // Ref to store the interval ID so we can clear it later
    const intervalIdRef = useRef(null);

    // Effect to handle the typing animation logic
    useEffect(() => {
        // 1. Cleanup any existing interval before starting a new one
        // This is important if the 'text' or 'speed' props change
        clearInterval(intervalIdRef.current);

        // 2. Reset the state when the text prop changes or the component mounts
        setDisplayedCharCount(0);

        // 3. If the text prop is empty or not provided, just return immediately
        if (!text || text.length === 0) {
            // Optionally call completion callback immediately for empty text
            if (onTypingComplete) {
                onTypingComplete();
            }
            return;
        }

        // 4. Set up the interval to add characters
        intervalIdRef.current = setInterval(() => {
            // Use functional update to get the latest state value safely
            setDisplayedCharCount(prevCount => {
                const nextCount = prevCount + 1;

                // Check if we have displayed all characters
                if (nextCount > text.length) {
                    // If we somehow went past the end, clear interval and return previous count
                    clearInterval(intervalIdRef.current);
                    // Ensure completion is called exactly once when text is fully displayed
                    // This condition also prevents multiple calls if the interval somehow fires extra times
                    if (onTypingComplete) {
                        onTypingComplete();
                    }
                    return prevCount; // Don't go past the total length
                }

                // If not at the end, update the count
                if (nextCount === text.length) {
                    // If this is the last character, clear the interval *before* the state update
                    // This ensures the interval doesn't fire again after the last character
                    clearInterval(intervalIdRef.current);
                    if (onTypingComplete) {
                        // Call completion callback after the state update for the last character is scheduled
                        // This allows the parent to react *after* the final text is rendered
                        onTypingComplete();
                    }
                }


                return nextCount; // Update state to display one more character
            });
        }, speed);

        // 5. Cleanup function for useEffect
        // This runs when the component unmounts or when the dependencies ([text, speed, onTypingComplete]) change
        return () => {
            clearInterval(intervalIdRef.current);
        };

    }, [text, speed, onTypingComplete]); // Dependencies: re-run effect if text, speed, or onTypingComplete changes

    // Slice the text based on the current count of characters to display
    const displayedText = text ? text.slice(0, displayedCharCount) : '';

    // Render the displayed text within a container element
    return (
        <span {...containerProps}>
            {displayedText}
        </span>
    );
}

export default TypingText;