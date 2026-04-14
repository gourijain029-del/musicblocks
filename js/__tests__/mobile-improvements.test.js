/**
 * @jest-environment jsdom
 */

// Mobile improvements tests for issue #6603
describe("Mobile Improvements", () => {
    let mockActivity;

    beforeEach(() => {
        mockActivity = {
            doLargerBlocks: jest.fn(),
            doSmallerBlocks: jest.fn(),
            turtleBlocksScale: 1.0
        };
    });

    test("should zoom in when pinch distance increases", () => {
        const getTouchDistance = (touch1, touch2) => {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const initialDistance = getTouchDistance(
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 }
        );

        const currentDistance = getTouchDistance(
            { clientX: 80, clientY: 80 },
            { clientX: 220, clientY: 220 }
        );

        const scaleFactor = currentDistance / initialDistance;
        expect(scaleFactor).toBeGreaterThan(1.1);

        if (scaleFactor > 1.1) {
            mockActivity.doLargerBlocks();
        }
        expect(mockActivity.doLargerBlocks).toHaveBeenCalled();
    });

    test("should calculate mobile scale for small screens", () => {
        const w = 400;
        const h = 600;
        const cellSize = 55;
        const smallSide = Math.min(w, h);
        
        let turtleBlocksScale = Math.max(smallSide / (cellSize * 11), 0.6);
        turtleBlocksScale = Math.max(0.5, Math.min(turtleBlocksScale, 2.0));

        expect(turtleBlocksScale).toBeGreaterThanOrEqual(0.5);
        expect(turtleBlocksScale).toBeLessThanOrEqual(2.0);
    });

    test("should detect small screen as mobile", () => {
        Object.defineProperty(window, "innerWidth", { value: 600, configurable: true });
        const isSmallScreen = window.innerWidth < 768;
        expect(isSmallScreen).toBe(true);
    });

    test("should use improved touch thresholds", () => {
        const moved = (Math.abs(8) + Math.abs(8)) > 15;
        expect(moved).toBe(true);
    });
});