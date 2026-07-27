import React, { useRef, useCallback, useMemo, useLayoutEffect, useState, useEffect } from "react";

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

const VIRTUALIZE_THRESHOLD = 30;

const VirtualList = function VirtualList({
  items,
  renderItem,
  gap = 0,
  overscan = 10,
  isStreaming,
  className,
}: VirtualListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isNearBottom = useRef(true);

  const updateNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
  }, []);

  const onVirtualScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(() => {
    updateNearBottom();
  }, [updateNearBottom]);

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

  if (items.length < VIRTUALIZE_THRESHOLD) {
    return (
      <div
        ref={containerRef}
        onScroll={updateNearBottom}
        className={className}
        style={{ overflowY: "auto", touchAction: "pan-y", overscrollBehavior: "contain" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={gap && i < items.length - 1 ? { marginBottom: gap } : undefined}
          >
            {renderItem(item, i)}
          </div>
        ))}
      </div>
    );
  }

  return <VirtualizedList
    containerRef={containerRef}
    items={items}
    renderItem={renderItem}
    gap={gap}
    overscan={overscan}
    onScroll={onVirtualScroll}
    className={className}
  />;
};

interface VirtualizedListProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  items: unknown[];
  renderItem: (item: unknown, index: number) => React.ReactNode;
  gap: number;
  overscan: number;
  onScroll: React.UIEventHandler<HTMLDivElement>;
  className?: string;
}

function VirtualizedList({
  containerRef,
  items,
  renderItem,
  gap,
  overscan,
  onScroll,
  className,
}: VirtualizedListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(800);
  const heightCache = useRef<Map<number, number>>(new Map());
  const [cacheVersion, setCacheVersion] = useState(0);
  const rafId = useRef<number | null>(null);
  const itemElements = useRef<Map<number, HTMLDivElement>>(new Map());

  const getHeight = useCallback(
    (index: number): number => heightCache.current.get(index) ?? 80,
    [],
  );

  const measureItem = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      itemElements.current.set(index, el);
      const h = el.getBoundingClientRect().height;
      if (h > 0) {
        const old = heightCache.current.get(index);
        if (old !== h) {
          heightCache.current.set(index, h);
          setCacheVersion((v) => v + 1);
        }
      }
    } else {
      itemElements.current.delete(index);
    }
  }, []);

  const totalHeight = useMemo(() => {
    if (items.length === 0) return 0;
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += getHeight(i);
    }
    return total + Math.max(0, items.length - 1) * gap;
  }, [items.length, getHeight, gap, cacheVersion]);

  const handleScrollRaf = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e);
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const el = containerRef.current;
      if (!el) return;
      setScrollTop(el.scrollTop);
      setViewHeight(el.clientHeight);
    });
  }, [onScroll, containerRef]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewHeight(el.clientHeight);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

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
  }, [items.length, scrollTop, viewHeight, getHeight, gap, overscan, cacheVersion]);

  // ResizeObserver on each item wrapper to track real-time height changes
  // (critical during streaming when the last message grows)
  useEffect(() => {
    const map = itemElements.current;
    if (map.size === 0) return;
    const ro = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const el = entry.target as HTMLDivElement;
        const h = entry.contentRect.height;
        if (h <= 0) continue;
        for (const [idx, element] of map.entries()) {
          if (element === el) {
            const old = heightCache.current.get(idx);
            if (old !== h) {
              heightCache.current.set(idx, h);
              changed = true;
            }
            break;
          }
        }
      }
      if (changed) setCacheVersion((v) => v + 1);
    });
    for (const el of map.values()) ro.observe(el);
    return () => ro.disconnect();
  }, [startIdx, endIdx]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScrollRaf}
      className={className}
      style={{ overflowY: "auto", touchAction: "pan-y", overscrollBehavior: "contain" }}
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
}

export { VirtualList };
export type { VirtualListProps };
