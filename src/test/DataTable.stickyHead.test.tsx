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

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';

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

let container: HTMLDivElement;

function renderTable(extraSettings: Record<string, unknown> = {}) {
    act(() => {
        ReactDOM.render(
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
            container,
        );
    });
    return {container};
}

function unmountTable() {
    act(() => {
        ReactDOM.unmountComponentAtNode(container);
    });
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
// Suppress React 18 legacy-API deprecation warnings.
// The project pins @types/react-dom@16, so we use the legacy render API;
// the warnings are expected and do not affect correctness.
// ---------------------------------------------------------------------------
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((msg: string) => {
        if (
            typeof msg === 'string' &&
            (msg.includes('ReactDOM.render is no longer supported') ||
                msg.includes('ReactDOMTestUtils.act') ||
                msg.includes('unmountComponentAtNode is deprecated'))
        ) {
            return;
        }
        // eslint-disable-next-line no-console
        console.warn(msg);
    });
});

afterAll(() => {
    jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let originalResizeObserver: typeof ResizeObserver;
let originalRaf: typeof requestAnimationFrame;
let originalCaf: typeof cancelAnimationFrame;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

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
    unmountTable();
    container.remove();

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
        renderTable();
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
        renderTable();
        const observer = MockResizeObserver.instances[0];
        expect(observer.disconnected).toBe(false);
        unmountTable();
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
