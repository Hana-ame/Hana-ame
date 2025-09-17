import { useState } from 'react';
import { MathJaxHtml, MathJaxFormula } from 'mathjax3-react';

export default function MathEditor() {
  const [content, setContent] = useState('\\sqrt{x^2 + y^2}');
  
//   return <MathJaxHtml></MathJaxHtml>
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* 输入区 */}
        <div className="border rounded p-2">
          <textarea
            className="w-full h-32 p-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {/* 预览区 */}
        <div className="border rounded p-2">
          <MathJaxFormula 
            formula={`$$${content}$$`}
            className="text-blue-600 text-lg"
          />
        </div>

        <div>
            
          <MathJaxHtml
            html={`<div>$$${content}$$</div>`}
            ></MathJaxHtml>
        </div>
      </div>
    </div>
  );
}