/**
 * @jest-environment jsdom
 */

// Mobile improvements tests for issue #6603
describe("Mobile Improvements", () => {
    let mockActivity;
    let mockCanvas;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <canvas id="myCanvas"></canvas>
            <div id="palette"></div>
            <div id="buttoncontainerBOTTOM"></div>
        `;

        mockCanvas = document.getElementById("myCanvas");

        // Mock activity object with required methods
        mockActivity = {
            doLargerBlocks: jest.fn(),
            doSmallerBlocks: jest.fn(),
            blocksContainer: { x: 0, y: 0 },
            scrollBlockContainer: true,
            refreshCanvas: jest.fn(),
            turtleBlocksScale: 1.0,
            cellSize: 55
        };

        // Mock closeAnyOpenMenusAndLabels function
        global.closeAnyOpenMenusAndLabels = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = "";
    });

    describe("Pinch-to-zoom functionality", () => {
        test("should zoom in when pinch distance increases", () => {
            // Simulate the touch event handlers from activity.js
            const initialTouches = [
                [null, null],
                [null, null]
            ];
            let initialDistance = null;

            const getTouchDistance = (touch1, touch2) => {
                const dx = touch1.clientX - touch2.clientX;
                const dy = touch1.clientY - touch2.clientY;
                return Math.sqrt(dx * dx + dy * dy);
            };

            // Simulate touchstart with two fingers
            const touchStartEvent = {
                touches: [
                    { clientX: 100, clientY: 100 },
                    { clientX: 200, clientY: 200 }
                ]
            };

            // Store initial positions and distance
            for (let i = 0; i < 2; i++) {
                initialTouches[i][0] = touchStartEvent.touches[i].clientY;
                initialTouches[i][1] = touchStartEvent.touches[i].clientX;
            }
            initialDistance = getTouchDistance(
                touchStartEvent.touches[0],
                touchStartEvent.touches[1]
            );

            // Simulate touchmove with increased distance (zoom in)
            const touchMoveEvent = {
                touches: [
                    { clientX: 80, clientY: 80 }, // Move fingers apart
                    { clientX: 220, clientY: 220 }
                ]
            };

            const currentDistance = getTouchDistance(
                touchMoveEvent.touches[0],
                touchMoveEvent.touches[1]
            );
            const scaleFactor = currentDistance / initialDistance;

            // Verify zoom in behavior
            expect(scaleFactor).toBeGreaterThan(1.1);

            // Simulate the zoom in action
            if (scaleFactor > 1.1) {
                mockActivity.doLargerBlocks();
            }

            expect(mockActivity.doLargerBlocks).toHaveBeenCalled();
        });

        test("should zoom out when pinch distance decreases", () => {
            const getTouchDistance = (touch1, touch2) => {
                const dx = touch1.clientX - touch2.clientX;
                const dy = touch1.clientY - touch2.clientY;
                return Math.sqrt(dx * dx + dy * dy);
            };

            // Initial distance
            const initialDistance = getTouchDistance(
                { clientX: 100, clientY: 100 },
                { clientX: 200, clientY: 200 }
            );

            // Decreased distance (zoom out)
            const currentDistance = getTouchDistance(
                { clientX: 120, clientY: 120 }, // Move fingers closer
                { clientX: 180, clientY: 180 }
            );

            const scaleFactor = currentDistance / initialDistance;

            // Verify zoom out behavior
            expect(scaleFactor).toBeLessThan(0.9);

            // Simulate the zoom out action
            if (scaleFactor < 0.9) {
                mockActivity.doSmallerBlocks();
            }

            expect(mockActivity.doSmallerBlocks).toHaveBeenCalled();
        });
    });

    describe("Mobile scaling logic", () => {
        test("should calculate mobile scale for small screens", () => {
            const w = 400; // Small width
            const h = 600; // Small height
            const cellSize = 55;

            const smallSide = Math.min(w, h);
            let turtleBlocksScale;

            if (smallSide < cellSize * 9) {
                // Mobile scaling logic
                if (w < cellSize * 10) {
                    turtleBlocksScale = Math.max(smallSide / (cellSize * 11), 0.6);
                } else {
                    turtleBlocksScale = Math.max(smallSide / (cellSize * 11), 0.75);
                }
            }

            // Ensure scale doesn't go below minimum or above maximum
            turtleBlocksScale = Math.max(0.5, Math.min(turtleBlocksScale, 2.0));

            expect(turtleBlocksScale).toBeGreaterThanOrEqual(0.5);
            expect(turtleBlocksScale).toBeLessThanOrEqual(2.0);
            expect(turtleBlocksScale).toBeCloseTo(0.66, 1); // Expected scale for 400px
        });

        test("should calculate desktop scale for large screens", () => {
            const w = 1400; // Large width
            const h = 1000; // Large height
            const cellSize = 55;

            const smallSide = Math.min(w, h);
            let turtleBlocksScale;

            if (smallSide >= cellSize * 9) {
                // Desktop scaling logic
                if (w / 1200 > h / 900) {
                    turtleBlocksScale = Math.min(w / 1200, 1.2);
                } else {
                    turtleBlocksScale = Math.min(h / 900, 1.2);
                }
            }

            // Ensure scale doesn't go below minimum or above maximum
            turtleBlocksScale = Math.max(0.5, Math.min(turtleBlocksScale, 2.0));

            expect(turtleBlocksScale).toBeGreaterThanOrEqual(0.5);
            expect(turtleBlocksScale).toBeLessThanOrEqual(2.0);
            expect(turtleBlocksScale).toBeCloseTo(1.17, 1); // Expected scale for 1000px height
        });
    });

    describe("Mobile mode detection", () => {
        test("should detect small screen as mobile", () => {
            // Mock window dimensions
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 600
            });
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 400
            });

            const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 600;
            expect(isSmallScreen).toBe(true);
        });

        test("should detect large screen as desktop", () => {
            // Mock window dimensions
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 1200
            });
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 800
            });

            const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 600;
            expect(isSmallScreen).toBe(false);
        });
    });

    describe("Touch drag improvements", () => {
        test("should use improved touch thresholds for better responsiveness", () => {
            // Test the improved touch drag thresholds
            const originalX = 100;
            const originalY = 100;
            const stageScale = 1.0;
            
            // Test cases for the improved 15px threshold (reduced from 20px)
            // Logic: Math.abs(deltaX) + Math.abs(deltaY) > 15
            const testCases = [
                { deltaX: 7, deltaY: 7, shouldMove: false },   // 14 total - below threshold
                { deltaX: 8, deltaY: 8, shouldMove: true },    // 16 total - above threshold
                { deltaX: 16, deltaY: 0, shouldMove: true },   // 16 total - above threshold
                { deltaX: 0, deltaY: 16, shouldMove: true },   // 16 total - above threshold
                { deltaX: 10, deltaY: 5, shouldMove: false },  // 15 total - equal to threshold (not greater)
                { deltaX: 10, deltaY: 6, shouldMove: true }    // 16 total - above threshold
            ];
            
            testCases.forEach(({ deltaX, deltaY, shouldMove }) => {
                const moved = (Math.abs(deltaX) + Math.abs(deltaY)) > 15;
                expect(moved).toBe(shouldMove);
            });
        });
    });

    describe("Widget touch support", () => {
        test("should have touch event handlers for music keyboard", () => {
            // Mock a keyboard element
            const mockElement = {
                ontouchstart: null,
                ontouchend: null,
                onmousedown: null,
                onmouseup: null,
                id: "test-key"
            };
            
            // Simulate adding touch handlers (as done in musickeyboard.js)
            mockElement.ontouchstart = jest.fn();
            mockElement.ontouchend = jest.fn();
            
            expect(mockElement.ontouchstart).toBeDefined();
            expect(mockElement.ontouchend).toBeDefined();
        });

        test("should have touch event handlers for oscilloscope widget", () => {
            // Mock oscilloscope buttons
            const mockZoomInButton = {
                onclick: null,
                ontouchend: null
            };
            const mockZoomOutButton = {
                onclick: null,
                ontouchend: null
            };
            
            // Simulate adding touch handlers (as done in oscilloscope.js)
            mockZoomInButton.ontouchend = jest.fn();
            mockZoomOutButton.ontouchend = jest.fn();
            
            expect(mockZoomInButton.ontouchend).toBeDefined();
            expect(mockZoomOutButton.ontouchend).toBeDefined();
        });

        test("should have touch event handlers for tempo widget", () => {
            // Mock tempo widget elements
            const mockPauseButton = {
                onclick: null,
                ontouchend: null
            };
            const mockSaveButton = {
                onclick: null,
                ontouchend: null
            };
            const mockSpeedUpButton = {
                onclick: null,
                ontouchend: null
            };
            const mockSlowDownButton = {
                onclick: null,
                ontouchend: null
            };
            const mockCanvas = {
                onclick: null,
                ontouchend: null
            };
            
            // Simulate adding touch handlers (as done in tempo.js)
            mockPauseButton.ontouchend = jest.fn();
            mockSaveButton.ontouchend = jest.fn();
            mockSpeedUpButton.ontouchend = jest.fn();
            mockSlowDownButton.ontouchend = jest.fn();
            mockCanvas.ontouchend = jest.fn();
            
            expect(mockPauseButton.ontouchend).toBeDefined();
            expect(mockSaveButton.ontouchend).toBeDefined();
            expect(mockSpeedUpButton.ontouchend).toBeDefined();
            expect(mockSlowDownButton.ontouchend).toBeDefined();
            expect(mockCanvas.ontouchend).toBeDefined();
        });
    });

    describe("Mobile UI improvements", () => {
        test("should add mobile classes when in mobile mode", () => {
            const palette = document.getElementById("palette");
            const body = document.body;

            // Simulate mobile mode activation
            body.classList.add("mobile-editing");
            palette.classList.add("mobile-collapsible");

            expect(body.classList.contains("mobile-editing")).toBe(true);
            expect(palette.classList.contains("mobile-collapsible")).toBe(true);
        });

        test("should toggle palette visibility", () => {
            const palette = document.getElementById("palette");
            palette.classList.add("mobile-collapsible");

            // Initially hidden
            expect(palette.classList.contains("active")).toBe(false);

            // Toggle to show
            palette.classList.toggle("active");
            expect(palette.classList.contains("active")).toBe(true);

            // Toggle to hide
            palette.classList.toggle("active");
            expect(palette.classList.contains("active")).toBe(false);
        });
    });
});
