/**
 * @jest-environment jsdom
 *
 * Tests for sticky-head / ResizeObserver integration.
 *
 * Problem: when cell content changes asynchronously (e.g. via useEffect +
 * dangerouslySetInnerHTML), only the tbody re-renders. Neither
 * TableHead.componentDidUpdate nor window.resize fires, so the sticky head
 * stays at stale column widths.
 *
 * Fix: DataTable installs a ResizeObserver on _box when stickyHead is enabled,
 * debounces callbacks through requestAnimationFrame, and disconnects on unmount.
 */

import '@testing-library/jest-dom';
import {act, render} from '@testing-library/react';
import * as React from 'react';

import DataTable from '../lib/DataTable';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COLUMNS = [
    {name: 'name', header: 'Name'},
    {name: 'value', header: 'Value'},
];

const DATA = [
    {name: 'Alice', value: 1},
    {name: 'Bob', value: 2},
];

function renderTable(extraSettings: Record<string, unknown> = {}) {
    return render(
        <DataTable
            columns={COLUMNS}
            data={DATA}
            theme="yandex-cloud"
            settings={{
                stickyHead: DataTable.MOVING,
                syncHeadOnResize: true,
                ...extraSettings,
            }}
        />,
    );
}

// ---------------------------------------------------------------------------
// ResizeObserver mock
// ---------------------------------------------------------------------------

type ROCallback = (entries: ResizeObserverEntry[]) => void;

class MockResizeObserver {
    static instances: MockResizeObserver[] = [];

    callback: ROCallback;
    observedTargets: Element[] = [];
    disconnected = false;

    constructor(cb: ROCallback) {
        this.callback = cb;
        MockResizeObserver.instances.push(this);
    }

    observe(target: Element) {
        this.observedTargets.push(target);
    }

    disconnect() {
        this.disconnected = true;
    }

    /** Simulate a content/size change (triggers the stored callback). */
    triggerResize() {
        this.callback([] as unknown as ResizeObserverEntry[]);
    }
}

// ---------------------------------------------------------------------------
// rAF mock
// ---------------------------------------------------------------------------

let rafCallbacks: FrameRequestCallback[] = [];

function mockRaf(cb: FrameRequestCallback): number {
    rafCallbacks.push(cb);
    return rafCallbacks.length; // non-zero handle
}

function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb(performance.now()));
}

function mockCancelAnimationFrame(handle: number) {
    rafCallbacks = rafCallbacks.filter((_, i) => i + 1 !== handle);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let originalResizeObserver: typeof ResizeObserver;
let originalRaf: typeof requestAnimationFrame;
let originalCaf: typeof cancelAnimationFrame;

beforeEach(() => {
    MockResizeObserver.instances = [];
    rafCallbacks = [];

    originalResizeObserver = (global as any).ResizeObserver;
    originalRaf = global.requestAnimationFrame;
    originalCaf = global.cancelAnimationFrame;

    (global as any).ResizeObserver = MockResizeObserver;
    global.requestAnimationFrame = mockRaf as unknown as typeof requestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
});

afterEach(() => {
    (global as any).ResizeObserver = originalResizeObserver;
    global.requestAnimationFrame = originalRaf;
    global.cancelAnimationFrame = originalCaf;
    MockResizeObserver.instances = [];
    rafCallbacks = [];
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ResizeObserver — setup and teardown', () => {
    test('creates a ResizeObserver when stickyHead is enabled', () => {
        renderTable();
        expect(MockResizeObserver.instances).toHaveLength(1);
    });

    test('observes the _box element', () => {
        const {container} = renderTable();
        const observer = MockResizeObserver.instances[0];
        expect(observer.observedTargets).toHaveLength(1);
        // _box is the scrollable wrapper div that carries data-table__box class
        expect(container.querySelector('.data-table__box')).toBe(observer.observedTargets[0]);
    });

    test('does NOT create a ResizeObserver when stickyHead is disabled', () => {
        renderTable({stickyHead: false});
        expect(MockResizeObserver.instances).toHaveLength(0);
    });

    test('disconnects ResizeObserver on unmount', () => {
        const {unmount} = renderTable();
        const observer = MockResizeObserver.instances[0];
        expect(observer.disconnected).toBe(false);
        unmount();
        expect(observer.disconnected).toBe(true);
    });
});

describe('ResizeObserver — syncHeadWidths debouncing', () => {
    test('schedules a rAF when a resize event fires', () => {
        renderTable();
        const observer = MockResizeObserver.instances[0];

        // Flush whatever rAFs componentDidMount already queued
        rafCallbacks = [];

        act(() => {
            observer.triggerResize();
        });

        // Our debounce rAF should now be queued
        expect(rafCallbacks).toHaveLength(1);
    });

    test('coalesces multiple rapid resize events into one rAF', () => {
        renderTable();
        const observer = MockResizeObserver.instances[0];
        rafCallbacks = [];

        act(() => {
            observer.triggerResize();
            observer.triggerResize();
            observer.triggerResize();
        });

        // Only one rAF should be pending regardless of how many times the
        // observer fired before the frame was processed.
        expect(rafCallbacks).toHaveLength(1);
    });

    test('accepts a new sync request after the previous rAF is flushed', () => {
        renderTable();
        const observer = MockResizeObserver.instances[0];
        rafCallbacks = [];

        act(() => {
            observer.triggerResize();
        });
        expect(rafCallbacks).toHaveLength(1);

        act(() => {
            flushRaf(); // execute the rAF → _syncHeadRaf resets to 0
        });
        // flushRaf runs syncHeadWidths → _calculateColumnsWidth, which queues
        // its own rAF for measuring column widths. Clear that before the next check.
        rafCallbacks = [];

        act(() => {
            observer.triggerResize();
        });
        // A new debounce rAF should be accepted now
        expect(rafCallbacks).toHaveLength(1);
    });
});

describe('ResizeObserver — environment without ResizeObserver', () => {
    test('does not throw when ResizeObserver is unavailable', () => {
        (global as any).ResizeObserver = undefined;
        expect(() => renderTable()).not.toThrow();
    });
});
