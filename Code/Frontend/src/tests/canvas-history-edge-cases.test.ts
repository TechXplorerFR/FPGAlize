import { describe, test, expect, beforeEach } from "vitest";
import {
  type CanvasState,
  CanvasHistory,
} from "../lib/services/canvas-history";

// Mock Element type
type Element = {
  id: number;
  name: string;
  x: number;
  y: number;
  connectedTo: number[];
  icon: string; // Added property
  isDragging: boolean; // Added property
};
describe("CanvasHistory Edge Cases", () => {
  const createMockElement = (id: number, x: number, y: number): Element => ({
    id,
    name: `Element ${id}`,
    x,
    y,
    connectedTo: [],
    icon: `icon-${id}`, // Mock value for icon
    isDragging: false, // Mock value for isDragging
  });

  const createInitialState = (): CanvasState => {
    const elements = [
      createMockElement(1, 10, 10),
      createMockElement(2, 100, 100),
    ];

    return {
      elements,
      elementPositions: new Map(
        elements.map((el) => [el.id.toString(), { x: el.x, y: el.y }])
      ),
    };
  };

  let initialState: CanvasState;
  let canvasHistory: CanvasHistory;

  beforeEach(() => {
    initialState = createInitialState();
    canvasHistory = new CanvasHistory(initialState);
  });

  test("should handle undo with no prior history", () => {
    // Attempt to undo with no history (only initial state)
    const result = canvasHistory.undo();

    // Should return null
    expect(result).toBeNull();
    expect(canvasHistory.canUndo()).toBe(false);
  });

  test("should handle redo with no future history", () => {
    // Attempt to redo with no future history
    const result = canvasHistory.redo();

    // Should return null
    expect(result).toBeNull();
    expect(canvasHistory.canRedo()).toBe(false);
  });

  test("should clone states properly without reference issues", () => {
    // Create a new state
    const newState: CanvasState = {
      elements: [...initialState.elements],
      elementPositions: new Map(initialState.elementPositions),
    };

    // Modify the new state
    newState.elements[0].x = 50;
    newState.elementPositions.set("1", { x: 50, y: 10 });

    // Push the new state
    canvasHistory.push(newState);

    // Now modify the original newState object
    newState.elements[0].x = 200;
    newState.elementPositions.set("1", { x: 200, y: 10 });

    // Undo should return the state with x=50, not x=200
    const undoResult = canvasHistory.undo();
    expect(undoResult?.elements[0].x).toBe(10); // Original value

    // Redo should return the state with x=50, not x=200
    const redoResult = canvasHistory.redo();
    expect(redoResult?.elements[0].x).toBe(50); // The value we pushed
  });

  test("should handle multiple undo/redo operations correctly", () => {
    // Push multiple states
    for (let i = 1; i <= 5; i++) {
      const newState: CanvasState = {
        elements: [
          {
            ...initialState.elements[0],
            x: initialState.elements[0].x + i * 10,
          },
          {
            ...initialState.elements[1],
            y: initialState.elements[1].y + i * 10,
          },
        ],
        elementPositions: new Map([
          [
            "1",
            {
              x: initialState.elements[0].x + i * 10,
              y: initialState.elements[0].y,
            },
          ],
          [
            "2",
            {
              x: initialState.elements[1].x,
              y: initialState.elements[1].y + i * 10,
            },
          ],
        ]),
      };

      canvasHistory.push(newState);
    }

    // Should be able to undo 5 times
    for (let i = 5; i >= 1; i--) {
      const state = canvasHistory.undo();

      if (i === 1) {
        // Last undo should return initial state
        expect(state?.elements[0].x).toBe(10);
      } else {
        expect(state?.elements[0].x).toBe(10 + (i - 1) * 10);
      }
    }

    // Should not be able to undo any more
    expect(canvasHistory.undo()).toBeNull();

    // Should be able to redo 5 times
    for (let i = 1; i <= 5; i++) {
      const state = canvasHistory.redo();
      expect(state?.elements[0].x).toBe(10 + i * 10);
    }

    // Should not be able to redo any more
    expect(canvasHistory.redo()).toBeNull();
  });

  test("should handle empty states correctly", () => {
    const emptyState: CanvasState = {
      elements: [],
      elementPositions: new Map(),
    };

    // Create a history with an empty initial state
    const emptyHistory = new CanvasHistory(emptyState);

    // Should be able to push and retrieve states normally
    const newState: CanvasState = {
      elements: [createMockElement(1, 30, 30)],
      elementPositions: new Map([["1", { x: 30, y: 30 }]]),
    };

    emptyHistory.push(newState);

    // Undo should return to empty state
    const undoResult = emptyHistory.undo();
    expect(undoResult?.elements.length).toBe(0);

    // Redo should return to added state
    const redoResult = emptyHistory.redo();
    expect(redoResult?.elements.length).toBe(1);
    expect(redoResult?.elements[0].x).toBe(30);
  });
});
