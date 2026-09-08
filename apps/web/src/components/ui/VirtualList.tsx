import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: () => number;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = () => 80,
  overscan = 5,
  className = '',
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div
          key={virtualRow.key}
          data-index={virtualRow.index}
          ref={rowVirtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          {renderItem(items[virtualRow.index], virtualRow.index)}
        </div>
      ))}
    </div>
  );
}