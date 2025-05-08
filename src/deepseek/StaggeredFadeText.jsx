import React, { useState, useEffect, useRef } from 'react';

/**
 * Recursively processes React children to find text nodes and wrap characters/words
 * for staggered animation.
 *
 * @param {*} node - The current node being processed (can be string, number, element, array).
 * @param {React.MutableRefObject<number>} globalIndexRef - A ref to track the global index of animated units.
 * @param {number} unitDelay - Delay between units (ms).
 * @param {number} fadeDuration - Fade duration for each unit (ms).
 * @param {boolean} startAnimation - Flag to trigger the animation CSS.
 * @param {'character' | 'word'} unit - Granularity of animation ('character' or 'word').
 * @returns {*} The processed node structure.
 */
function processChildren(node, globalIndexRef, unitDelay, fadeDuration, startAnimation, unit) {
    // Handle null, undefined, boolean children directly
    if (node === null || node === undefined || typeof node === 'boolean') {
        return node;
    }

    // Handle string or number children - these are the text nodes we want to animate
    if (typeof node === 'string' || typeof node === 'number') {
        const text = String(node);
        // Split text based on the chosen unit (character or word)
        // Using a regex split for words that keeps spaces so we can re-add them accurately
         // Using match(/\S+|\s+/g) splits into non-whitespace sequences and whitespace sequences
        const units = unit === 'word' ? text.match(/\S+|\s+/g) || [] : text.split('');

        return units.map((u, uIndex) => {
             // If unit is 'word' and this piece is just whitespace, render it directly without animation
             if (unit === 'word' && /^\s+$/.test(u)) {
                 return <span key={`word-space-${globalIndexRef.current++}`}>{u}</span>;
             }

            // Assign a unique global index for this animated unit and increment the ref
            // Only increment if it's an animated unit (i.e., not just whitespace in word mode)
            const currentUnitIndex = globalIndexRef.current++;

            return (
                <span
                    key={`unit-${currentUnitIndex}`} // Unique key based on global order
                    style={{
                        // Initial opacity is 0, target opacity is 1 when animation starts
                        opacity: startAnimation ? 1 : 0,
                        // Define the transition property: opacity over fadeDuration, with a delay based on global index
                        transition: `opacity ${fadeDuration}ms ease-out ${currentUnitIndex * unitDelay}ms`,
                        // Ensure spans are inline to maintain text flow within parent elements
                        display: 'inline',
                        // Preserve whitespace *within* units if splitting by character
                        whiteSpace: unit === 'character' ? 'pre-wrap' : undefined, // pre-wrap handles spaces and line breaks
                    }}
                >
                    {/* Render the unit */}
                    {/* For character split, render non-breaking space for actual spaces */}
                    {unit === 'character' && u === ' ' ? '\u00A0' : u}
                     {/* For word split, render the word itself */}
                    {unit === 'word' && u}
                </span>
            );
        });
    }

    // Handle arrays of children - recursively process each item in the array
    if (Array.isArray(node)) {
         // React.Children.map is safer than array.map for processing children
        return React.Children.map(node, (child, index) =>
             processChildren(child, globalIndexRef, unitDelay, fadeDuration, startAnimation, unit)
             // React.Children.map handles null/undefined/boolean/string children correctly internally,
             // and automatically assigns keys if none are present.
        );
    }

    // Handle single React element children - clone the element and process its children recursively
    if (React.isValidElement(node)) {
        // Recursively process the element's children
        // Pass the globalIndexRef down, it will be mutated during processing
        const processedElementChildren = processChildren(node.props.children, globalIndexRef, unitDelay, fadeDuration, startAnimation, unit);

        // Clone the original element, pass its original props, and replace its children with the processed ones
        // React.cloneElement preserves the original element's key and ref.
        return React.cloneElement(node, node.props, processedElementChildren);
    }

    // Handle other types (like functions, objects) - return them directly
    return node;
}


/**
 * A React component that displays children with a staggered fade-in effect,
 * including a fade-in background if provided via containerProps.style.backgroundColor.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The content to be displayed and animated.
 * @param {number} [props.unitDelay=50] - The delay (in milliseconds) before the next unit (char/word) starts fading in.
 * @param {number} [props.fadeDuration=500] - The duration (in milliseconds) of the fade-in effect for each unit and the background.
 * @param {'character' | 'word'} [props.unit='character'] - The granularity of animation ('character' or 'word').
 * @param {function} [props.onAnimationComplete] - Callback function called when the entire text animation is finished.
 * @param {object} [props.containerProps] - Optional props to apply to the main wrapping element (e.g., className, style).
 *                                         Use containerProps.style to set background properties.
 */
function StaggeredFadeText({
    children,
    unitDelay = 50,
    fadeDuration = 500,
    unit = 'character',
    onAnimationComplete,
    containerProps = {},
}) {
    // State to trigger the animation via CSS transitions
    const [startAnimation, setStartAnimation] = useState(false);

    // Ref to store the timeout ID for the completion callback
    const completionTimeoutRef = useRef(null);

    // Ref to count the total number of animated units during rendering
    const totalAnimatedUnitsRef = useRef(0);

    // Effect to trigger the animation state change
    useEffect(() => {
        // Reset animation state when relevant props change
        setStartAnimation(false);

         // Use requestAnimationFrame to ensure the initial state (opacity: 0) is applied
         // before triggering the transition (opacity: 1). This helps with rendering timing.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                 // Trigger the animation state change
                setStartAnimation(true);
            });
        });

        // Cleanup function for this effect: currently no cleanup needed besides the general timeout

        // Dependencies: Re-run if children structure/content, timing, or unit props change.
        // Including 'children' directly can be problematic if it's a new object on every render,
        // but React's diffing is usually smart enough. Including other props that affect
        // the start or style is necessary.
    }, [children, unitDelay, fadeDuration, unit]); // Dependencies


     // Effect to set the animation completion timeout
     // This effect runs *after* the render cycle where totalAnimatedUnitsRef.current is populated
    useEffect(() => {
        // Clear any existing completion timeout
        clearTimeout(completionTimeoutRef.current);

        const totalUnits = totalAnimatedUnitsRef.current; // Get the count from the ref

        if (totalUnits > 0) {
            // Calculate the total duration of the text animation: (delay for the last unit) + (fade duration)
            const totalTextAnimationDuration = (totalUnits - 1) * unitDelay + fadeDuration;

            // Set the timeout for the completion callback based on the text animation duration
            // (The background fade duration is considered independent/concurrent)
            completionTimeoutRef.current = setTimeout(() => {
                if (onAnimationComplete) {
                    onAnimationComplete();
                }
            }, totalTextAnimationDuration);
        } else {
             // If there were no animated units (e.g., children was empty or only non-text elements),
             // call the completion callback immediately.
            if (onAnimationComplete) {
                onAnimationComplete();
            }
        }

        // Cleanup function for this effect: clear the completion timeout
        return () => {
            clearTimeout(completionTimeoutRef.current);
        };

        // Dependencies: re-run this effect if the total number of units or timing changes.
        // totalAnimatedUnitsRef.current changes during render, but the effect reads its final value after render.
        // unitDelay, fadeDuration, onAnimationComplete are explicitly used.
    }, [totalAnimatedUnitsRef.current, unitDelay, fadeDuration, onAnimationComplete]); // Dependencies


    // --- Render Logic ---
    // Reset the global index counter BEFORE processing children for THIS render pass
    totalAnimatedUnitsRef.current = 0;

    // Process the children structure, wrapping text units with animation spans
    const processedChildren = processChildren(
        children,
        totalAnimatedUnitsRef, // Pass the ref so the helper can mutate it
        unitDelay,
        fadeDuration,
        startAnimation,
        unit // Pass the unit granularity
    );

    // totalAnimatedUnitsRef.current now holds the final count of animated units for this render

    // Calculate dynamic styles for the container element (opacity and transition)
    const containerDynamicStyle = {
        // Initial opacity 0, final opacity 1 when animation starts
        opacity: startAnimation ? 1 : 0,
        // Transition for opacity over the specified fadeDuration, with no delay
        // This makes the container (and its background) fade in immediately when startAnimation becomes true
        transition: `opacity ${fadeDuration}ms ease-out 0ms`,
        // Optional: Set display property if needed for layout/background
        // display: 'block', // Use 'block' if you want the container to take full width
        // display: 'inline-block' // Use 'inline-block' if it should wrap content and have a background
    };

    // Merge user-provided styles from containerProps.style with our dynamic styles
    const mergedContainerStyle = {
        ...containerProps.style,
        ...containerDynamicStyle,
    };

    return (
        // Use a div as the main container for better background application.
        // If inline behavior is strictly needed, change this back to span and potentially add display: 'inline-block' style.
        <div // Changed from span to div - adjust if inline behavior is needed
            {...containerProps} // Spread original containerProps (including className etc.)
            style={mergedContainerStyle} // Apply the merged styles
        >
            {processedChildren}
        </div>
    );
}

export default StaggeredFadeText;