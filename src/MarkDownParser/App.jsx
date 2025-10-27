import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 用于解析 URL 查询参数的辅助 Hook
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Markdown 渲染核心组件
const MarkdownRenderer = () => {
  const query = useQuery();
  const markdownUrl = query.get('url');
  const [markdownContent, setMarkdownContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (markdownUrl) {
      fetch(markdownUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('网络响应错误');
          }
          return response.text();
        })
        .then(text => setMarkdownContent(text))
        .catch(err => setError(`无法加载 Markdown 文件: ${err.message}`));
    }
  }, [markdownUrl]);

  if (!markdownUrl) {
    return <div style={{ padding: '20px' }}><h1>请提供一个 Markdown 文件 URL</h1><p>用法示例: <code>?url=https://raw.githubusercontent.com/remarkjs/react-markdown/main/readme.md</code></p></div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}><h1>错误</h1><p>{error}</p></div>;
  }

  // 自定义渲染器
  const components = {
    // 自定义 h1 标题样式
    h1: ({ node, ...props }) => <h1 style={{ color: 'cornflowerblue', borderBottom: '2px solid lightblue', paddingBottom: '10px' }} {...props} />,

    // 自定义段落样式
    p: ({ node, ...props }) => <p style={{ fontSize: '16px', lineHeight: '1.6' }} {...props} />,

    // 自定义代码块，并集成语法高亮
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={a11yDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <ReactMarkdown
        children={markdownContent}
        remarkPlugins={[remarkBreaks]}
        components={components}
      />
    </div>
  );
};

// App 入口
const App = () => {
  return (
    <Router>
      <MarkdownRenderer />
    </Router>
  );
};

export default App;