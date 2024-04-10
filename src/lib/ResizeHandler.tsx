import React from 'react';

import {b, calculateColumnWidth, rafThrottle} from './util';

interface ResizeHandlerProps {
    getColumn: (index?: number) => HTMLTableCellElement | undefined;
    columnIndex?: number;
    columnId: string;
    maxWidth?: number;
    minWidth?: number;
    onResize?: (columnId: string, width: number) => void;
}

export function ResizeHandler({
    getColumn,
    columnIndex,
    columnId,
    minWidth,
    maxWidth,
    onResize,
}: ResizeHandlerProps) {
    const elementRef = React.useRef<HTMLElement>(null);

    const [resizing, setResizing] = React.useState(false);

    React.useEffect(() => {
        const element = elementRef.current;

        if (!element) {
            return undefined;
        }

        let mouseXPosition: number | undefined;
        let initialColumnWidth: number | undefined;
        let currentColumnWidth: number | undefined;

        const onMouseMove = rafThrottle((e: MouseEvent) => {
            restrictMouseEvent(e);

            if (typeof mouseXPosition !== 'number' || typeof initialColumnWidth !== 'number') {
                return;
            }

            const xDiff = e.clientX - mouseXPosition;

            const newWidth = calculateColumnWidth(initialColumnWidth + xDiff, minWidth, maxWidth);

            if (newWidth === currentColumnWidth) {
                return;
            }

            currentColumnWidth = newWidth;

            onResize?.(columnId, currentColumnWidth);
        });

        const onMouseUp = (e: MouseEvent) => {
            restrictMouseEvent(e);

            if (currentColumnWidth !== undefined) {
                onResize?.(columnId, currentColumnWidth);
            }

            setResizing(false);
            mouseXPosition = undefined;

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        const onMouseDown = (e: MouseEvent) => {
            initialColumnWidth = getColumn(columnIndex)?.getBoundingClientRect().width;

            restrictMouseEvent(e);

            mouseXPosition = e.clientX;

            setResizing(true);

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        element.addEventListener('mousedown', onMouseDown);

        return () => {
            element.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [columnId, onResize, minWidth, maxWidth, getColumn, columnIndex]);

    return (
        <span
            ref={elementRef}
            className={b('resize-handler', {resizing})}
            // Prevent sort trigger on resize
            onClick={(e) => restrictMouseEvent(e)}
        />
    );
}

// Prevent sort trigger and text selection on resize
function restrictMouseEvent<
    T extends {preventDefault: VoidFunction; stopPropagation: VoidFunction},
>(e: T) {
    e.preventDefault();
    e.stopPropagation();
}
