import React, { useState, useRef, useCallback, useMemo, useLayoutEffect } from "react";

interface VirtualListProps {
  items: unknown[];
  renderItem: (item: unknown, index: number) => React.ReactNode;
  estimatedItemHeight: number;
  gap?: number;
  overscan?: number;
  isStreaming?: boolean;
  onAutoScroll?: boolean;
  className?: string;
}

const VirtualList = function VirtualList({
  items,
  renderItem,
  estimatedItemHeight,
  gap = 0,
  overscan = 5,
  isStreaming,
  className,
}: VirtualListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(800);
  const heightCache = useRef<Map<number, number>>(new Map());
  const rafId = useRef<number | null>(null);
  const isNearBottom = useRef(true);

  const getHeight = useCallback(
    (index: number): number =>
      heightCache.current.get(index) ?? estimatedItemHeight,
    [estimatedItemHeight],
  );

  const measureItem = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el && !heightCache.current.has(index)) {
      const h = el.getBoundingClientRect().height;
      if (h > 0) heightCache.current.set(index, h);
    }
  }, []);

  const totalHeight = useMemo(() => {
    if (items.length === 0) return 0;
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += getHeight(i);
    }
    return total + Math.max(0, items.length - 1) * gap;
  }, [items.length, getHeight, gap]);

  const handleScroll = useCallback(() => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const el = containerRef.current;
      if (!el) return;
      setScrollTop(el.scrollTop);
      setViewHeight(el.clientHeight);
      isNearBottom.current =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 60;
    });
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewHeight(el.clientHeight);
  }, []);

  const { startIdx, endIdx, offsetTop, offsetBottom } = useMemo(() => {
    if (items.length === 0 || viewHeight === 0) {
      return { startIdx: 0, endIdx: 0, offsetTop: 0, offsetBottom: 0 };
    }

    const viewTop = scrollTop;
    const viewBottom = scrollTop + viewHeight;

    let acc = 0;
    let s = 0;
    let e = items.length - 1;

    for (let i = 0; i < items.length; i++) {
      const h = getHeight(i);
      const itemTop = acc;
      const itemBottom = acc + h + gap;
      if (itemBottom <= viewTop) s = i + 1;
      if (itemTop < viewBottom) e = i;
      acc += h + gap;
    }

    s = Math.max(0, s - overscan);
    e = Math.min(items.length - 1, e + overscan);

    let top = 0;
    for (let i = 0; i < s; i++) top += getHeight(i) + gap;

    let bot = 0;
    for (let i = e + 1; i < items.length; i++) bot += getHeight(i) + gap;

    return { startIdx: s, endIdx: e, offsetTop: top, offsetBottom: bot };
  }, [items.length, scrollTop, viewHeight, getHeight, gap, overscan]);

  useLayoutEffect(() => {
    if (!isStreaming) return;
    const el = containerRef.current;
    if (!el) return;
    if (isNearBottom.current || el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      el.scrollTop = el.scrollHeight;
    }
  });

  if (items.length === 0) {
    return <div ref={containerRef} className={className} />;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={className}
      style={{ overflowY: "auto" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ height: offsetTop }} />
        {items.slice(startIdx, endIdx + 1).map((item, i) => {
          const realIndex = startIdx + i;
          return (
            <div
              key={realIndex}
              ref={(el) => measureItem(realIndex, el)}
              style={gap && realIndex < items.length - 1 ? { marginBottom: gap } : undefined}
            >
              {renderItem(item, realIndex)}
            </div>
          );
        })}
        <div style={{ height: offsetBottom }} />
      </div>
    </div>
  );
};

export { VirtualList };
export type { VirtualListProps };
