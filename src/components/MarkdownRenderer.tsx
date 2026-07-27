import React, { useState, useCallback, useMemo, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FiCopy,
  FiCheck as FiCheckCircle,
} from "react-icons/fi";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const codeIdCounterRef = React.useRef(0);

  const copyCode = useCallback(async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, []);

  const components = useMemo(
    () => ({
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";
        const codeId = ++codeIdCounterRef.current;
        const codeContent = String(children).replace(/\n$/, "");

        if (!inline && language) {
          return (
            <div className="relative my-2 group">
              <div className="overflow-x-auto rounded-t-md border border-gray-700">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  className="rounded-t-md text-sm m-0"
                  showLineNumbers={true}
                  wrapLines={false}
                  customStyle={{
                    margin: 0,
                    fontSize: "0.875rem",
                    background: "#1a1a1a",
                  }}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
              <div className="flex justify-between items-center bg-gray-900 border border-t-0 border-gray-700 rounded-b-md px-3 py-1">
                <span className="text-xs text-gray-500">{language}</span>
                <button
                  onClick={() => copyCode(codeContent, codeId)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                  title="复制代码"
                >
                  {copiedIndex === codeId ? (
                    <>
                      <FiCheckCircle className="text-green-500" size={14} />
                      <span className="text-green-500">已复制</span>
                    </>
                  ) : (
                    <>
                      <FiCopy size={14} />
                      <span>复制代码</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        }

        return (
          <code
            className="px-2 py-1 bg-gray-800 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      },
      pre({ node, children, ...props }: any) {
        return <div className="my-2" {...props}>{children}</div>;
      },
      table({ node, children, ...props }: any) {
        return (
          <div className="overflow-x-auto my-4 border border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-700" {...props}>
              {children}
            </table>
          </div>
        );
      },
      thead({ node, children, ...props }: any) {
        return (
          <thead className="bg-gray-800/80" {...props}>{children}</thead>
        );
      },
      tbody({ node, children, ...props }: any) {
        return (
          <tbody className="divide-y divide-gray-700/50" {...props}>{children}</tbody>
        );
      },
      tr({ node, children, ...props }: any) {
        return (
          <tr className="hover:bg-gray-800/30 transition-colors" {...props}>{children}</tr>
        );
      },
      th({ node, children, ...props }: any) {
        return (
          <th
            className="px-4 py-3 text-left text-sm font-semibold text-gray-200 bg-gray-800/60 border-b border-gray-700"
            {...props}
          >
            {children}
          </th>
        );
      },
      td({ node, children, ...props }: any) {
        return (
          <td
            className="px-4 py-3 text-sm text-gray-300 border-b border-gray-700/50"
            {...props}
          >
            {children}
          </td>
        );
      },
      blockquote({ node, children, ...props }: any) {
        return (
          <blockquote
            className="border-l-4 border-indigo-500 pl-4 py-2 my-3 italic bg-gray-800/30 rounded-r"
            {...props}
          >
            {children}
          </blockquote>
        );
      },
      ul({ node, children, ...props }: any) {
        return <ul className="list-disc pl-5 my-3 space-y-1" {...props}>{children}</ul>;
      },
      ol({ node, children, ...props }: any) {
        return <ol className="list-decimal pl-5 my-3 space-y-1" {...props}>{children}</ol>;
      },
      li({ node, children, ...props }: any) {
        return <li className="my-1 pl-1" {...props}>{children}</li>;
      },
      h1({ node, children, ...props }: any) {
        return (
          <h1
            className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-gray-700"
            {...props}
          >
            {children}
          </h1>
        );
      },
      h2({ node, children, ...props }: any) {
        return <h2 className="text-xl font-bold mt-5 mb-2" {...props}>{children}</h2>;
      },
      h3({ node, children, ...props }: any) {
        return <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>;
      },
      h4({ node, children, ...props }: any) {
        return <h4 className="text-base font-bold mt-3 mb-1" {...props}>{children}</h4>;
      },
      h5({ node, children, ...props }: any) {
        return <h5 className="text-sm font-bold mt-2 mb-1" {...props}>{children}</h5>;
      },
      h6({ node, children, ...props }: any) {
        return (
          <h6 className="text-sm font-semibold mt-2 mb-1 text-gray-400" {...props}>{children}</h6>
        );
      },
      hr({ node, ...props }: any) {
        return <hr className="my-6 border-gray-700" {...props} />;
      },
      a({ node, children, href, ...props }: any) {
        return (
          <a
            href={href}
            className="text-indigo-400 hover:text-indigo-300 underline hover:underline-offset-2 transition-all"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        );
      },
      strong({ node, children, ...props }: any) {
        return <strong className="font-bold text-gray-100" {...props}>{children}</strong>;
      },
      em({ node, children, ...props }: any) {
        return <em className="italic" {...props}>{children}</em>;
      },
      p({ node, children, ...props }: any) {
        return <p className="my-3 leading-relaxed" {...props}>{children}</p>;
      },
      img({ node, src, alt, ...props }: any) {
        return (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg my-3 border border-gray-700 shadow-lg"
            {...props}
          />
        );
      },
      del({ node, children, ...props }: any) {
        return <del className="line-through text-gray-500" {...props}>{children}</del>;
      },
    }),
    [copyCode],
  );

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
});

export { MarkdownRenderer };
