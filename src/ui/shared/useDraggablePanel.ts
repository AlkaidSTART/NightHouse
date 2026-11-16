import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

export interface PanelOffset {
  x: number;
  y: number;
}

export interface DraggablePanelResult<T extends HTMLElement> {
  panelRef: RefObject<T | null>;
  offset: PanelOffset;
  isDragging: boolean;
  panelStyle: CSSProperties;
  handleProps: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  };
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [data-no-drag="true"]';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 为浮层面板提供基于指针的自由拖拽能力。
 * 通过 `resetKey` 在切换内容（例如打开新物品或谜题）时恢复默认位置。
 */
export function useDraggablePanel<T extends HTMLElement>(
  resetKey?: string,
): DraggablePanelResult<T> {
  const panelRef = useRef<T | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [stored, setStored] = useState<{
    key: string | undefined;
    x: number;
    y: number;
  }>({ key: resetKey, x: 0, y: 0 });
  const [draggingKey, setDraggingKey] = useState<string | undefined | null>(
    null,
  );

  const offset: PanelOffset =
    stored.key === resetKey ? { x: stored.x, y: stored.y } : { x: 0, y: 0 };
  const isDragging = draggingKey !== null && draggingKey === (resetKey ?? '');

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent): void => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) {
        return;
      }
      const nextX = clamp(
        drag.originX + (event.clientX - drag.startX),
        drag.minX,
        drag.maxX,
      );
      const nextY = clamp(
        drag.originY + (event.clientY - drag.startY),
        drag.minY,
        drag.maxY,
      );
      setStored({ key: resetKey, x: nextX, y: nextY });
    };

    const handlePointerEnd = (event: PointerEvent): void => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) {
        return;
      }
      dragRef.current = null;
      setDraggingKey(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [isDragging, resetKey]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        return;
      }
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const rect = panel.getBoundingClientRect();
      const margin = 24;
      const baseLeft = rect.left - offset.x;
      const baseTop = rect.top - offset.y;

      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: offset.x,
        originY: offset.y,
        minX: margin - baseLeft,
        maxX: window.innerWidth - margin - (baseLeft + rect.width),
        minY: margin - baseTop,
        maxY: window.innerHeight - margin - (baseTop + rect.height),
      };
      setDraggingKey(resetKey ?? '');
    },
    [offset.x, offset.y, resetKey],
  );

  const panelStyle: CSSProperties =
    offset.x === 0 && offset.y === 0
      ? {}
      : { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` };

  return {
    panelRef,
    offset,
    isDragging,
    panelStyle,
    handleProps: { onPointerDown },
  };
}
