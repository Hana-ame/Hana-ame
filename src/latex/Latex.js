import { useState, useEffect } from 'react';

export default function LatexEditor() {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState('');

//   // 动态加载 MathJax 脚本
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
//     document.head.appendChild(script);
//     return () => script.remove();
//   }, []);

  // 输入转换逻辑
  const handleChange = (e) => {
    let text = e.target.value;
    setContent(text);
    text = text.replace(/\$\$/g, '$');
    text = text.replace(/\\\[|\\\]/g, '$');
    text = text.replace(/\$/g, '$$$$');
    setPreview(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">输入区</h2>
          <textarea
            value={content}
            onChange={handleChange}
            className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 resize-none font-mono"
            placeholder="粘贴或输入含 LaTeX 的内容..."
          />
        </div>

        {/* 预览区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 prose max-w-none">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">实时预览</h2>
          <textarea 
            className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 resize-none font-mono"
            id="preview" value={preview} />
        </div>
      </div>
    </div>
  );
}