import React, { useState } from 'react';
import TypingText from './TypingText'; // 假设你将上面的代码保存在 TypingText.js 文件中

function ExampleComponent() {
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    const handleTypingComplete = () => {
        console.log("Typing animation finished!");
        setIsTypingComplete(true);
    };

    return (
        <div>
            <h1>Typing Text Example</h1>
            <TypingText
                text="Hello, this text will appear character by character over time."
                speed={70} // Adjust speed (milliseconds per character)
                onTypingComplete={handleTypingComplete}
                containerProps={{
                     className: "text-lg font-mono text-blue-600" // Optional: add classes or styles to the span
                     // style: { borderBottom: '1px solid black' } // Example inline style
                }}
            />

            {isTypingComplete && (
                <p>Typing is complete!</p>
            )}

            <hr style={{margin: '20px 0'}}/>

             <h2>Another Example</h2>
            <TypingText
                text="Short message."
                speed={150}
            />

             <hr style={{margin: '20px 0'}}/>

             <h2>Empty Example</h2>
            <TypingText
                text="" // Empty text
                speed={150}
                onTypingComplete={() => console.log("Empty text completed immediately")}
            />
        </div>
    );
}

export default ExampleComponent;