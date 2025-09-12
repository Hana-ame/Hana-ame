// 三种模式之一,只有输入框,并且停用鼠标
import React, { useState } from 'react';

export default function TextAreaWithButton({ onSubmit }: { onSubmit: (text: string) => void }) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        onSubmit(text);
        setText('');
    };

    return (
        <div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}
