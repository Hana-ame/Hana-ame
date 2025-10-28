// 25.10.28
// create
// 用来渲染野生markdown文件的

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks'; // 引入插件

import './MarkdownViewer.css';

const MarkdownViewer = () => {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    // 解析URL参数
    const queryParams = new URLSearchParams(window.location.search);
    const markdownUrl = queryParams.get('url');

    if (markdownUrl) {
      setUrl(markdownUrl);
      fetchMarkdown(markdownUrl);
    } else {
      setLoading(false);
      setError('No URL parameter provided. Use ?url=https://example.com/markdown.md');
    }
  }, []);

  useEffect(() => {
    // 当markdown内容变化时，提取标题并设置页面标题
    if (markdown) {
      extractTitleFromMarkdown();
    }
  }, [markdown]);

  const extractTitleFromMarkdown = () => {
    // 查找第一个一级标题
    const match = markdown.match(/^#\s+(.+)$/m);
    if (match && match[1]) {
      // 设置浏览器标签标题
      document.title = `${match[1]} - 月桂树`;
    } else {
      document.title = 'Markdown Viewer - 月桂树';
    }
  };

  const fetchMarkdown = async (url) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch Markdown: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      setMarkdown(text);
    } catch (err) {
      // 用proxy重试
      try {
        const newUrl = new URL(url)
        newUrl.searchParams.set('proxy_host', newUrl.host);
        newUrl.host = 'proxy.moonchan.xyz';
        const response = await fetch(newUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch Markdown: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        setMarkdown(text);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching Markdown:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const CodeBlock = ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');

    return !inline && match ? (
      <>{String(children).replace(/\n$/, '')}</>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  const handleReload = () => {
    if (url) {
      fetchMarkdown(url);
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleLoadNewUrl = () => {
    if (url) {
      window.location.search = `?url=${encodeURIComponent(url)}`;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Markdown from {url}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Markdown</h2>
        <p>{error}</p>
        <div className="url-controls">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter Markdown URL"
          />
          <button onClick={handleLoadNewUrl}>Load</button>
          <button onClick={handleReload}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <main className="markdown-viewer">
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}  // 使用插件
          breaks={true}  // 添加这一行
          components={{
            code: CodeBlock,
            a: ({ node, children, href, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
                aria-label={children ? undefined : `Link to ${href}`}
              >
                {children ? children : href}
              </a>
            ),
            img: ({ node, alt, ...props }) => <img alt={alt || ''} style={{ maxWidth: '100%' }} {...props} />
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      <div className="footer">
        <p>Rendered with React Markdown Viewer | {new Date().toLocaleDateString()}</p> 
        <p><a href="https://moonchan.xyz/">月岛 - 匿名版</a></p>
      </div>
    </main>
  );
};

export default MarkdownViewer;