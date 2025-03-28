/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CanvasHistory, useCanvasHistory, type CanvasState } from '../lib/services/canvas-history';
import { type IElement, type IConnection } from "@/lib/types/types";

describe('CanvasHistory', () => {
  const createMockElement = (id: number, x: number, y: number): IElement => ({
    id,
    name: `Element ${id}`,
    type: `type-${id}`,
    x,
    y,
    inputs: [],
    outputs: [],
    internal_delay: 0,
    setup_time: 0
  });

  const createInitialState = (): CanvasState => {
    const elements = [
      createMockElement(1, 10, 10),
      createMockElement(2, 100, 100),
    ];
    const connections: IConnection[] = [];
    
    return {
      elements,
      connections,
      elementPositions: new Map(
        elements.map((el) => [el.id.toString(), { x: el.x ?? 0, y: el.y ?? 0 }])
      ),
    };
  };

  let initialState: CanvasState;
  let canvasHistory: CanvasHistory;

  beforeEach(() => {
    initialState = createInitialState();
    canvasHistory = new CanvasHistory(initialState);
  });

  test('should initialize with the initial state', () => {
    // The history should contain the initial state
    expect(canvasHistory.canUndo()).toBe(false);
    expect(canvasHistory.canRedo()).toBe(false);
  });

  test('should push new state to history', () => {
    // Create a modified state
    const newState: CanvasState = {
      elements: [...initialState.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(initialState.elementPositions),
    };
    
    // Modify an element position
    newState.elements[0].x = 50;
    newState.elementPositions.set('1', { x: 50, y: 10 });
    
    // Push the new state
    canvasHistory.push(newState);
    
    // Should be able to undo but not redo
    expect(canvasHistory.canUndo()).toBe(true);
    expect(canvasHistory.canRedo()).toBe(false);
  });

  test('should undo to previous state', () => {
    // Push a modified state
    const newState: CanvasState = {
      elements: [...initialState.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(initialState.elementPositions),
    };
    
    newState.elements[0].x = 50;
    newState.elementPositions.set('1', { x: 50, y: 10 });
    
    canvasHistory.push(newState);
    
    // Undo and get the previous state
    const undoResult = canvasHistory.undo();
    
    // Should get the initial state back
    expect(undoResult?.elements[0].x).toBe(10);
    expect(undoResult?.elements[1].x).toBe(100);
    
    // Should not be able to undo but can redo
    expect(canvasHistory.canUndo()).toBe(false);
    expect(canvasHistory.canRedo()).toBe(true);
  });

  test('should redo to next state after undoing', () => {
    // Push a modified state
    const newState: CanvasState = {
      elements: [...initialState.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(initialState.elementPositions),
    };
    
    newState.elements[0].x = 50;
    newState.elementPositions.set('1', { x: 50, y: 10 });
    
    canvasHistory.push(newState);
    
    // Undo first
    canvasHistory.undo();
    
    // Then redo to get back to newState
    const redoResult = canvasHistory.redo();
    
    // Should get the modified state back
    expect(redoResult?.elements[0].x).toBe(50);
    
    // Should be able to undo but not redo
    expect(canvasHistory.canUndo()).toBe(true);
    expect(canvasHistory.canRedo()).toBe(false);
  });

  test('should reset to initial state', () => {
    // Push multiple new states
    const newState1: CanvasState = {
      elements: [...initialState.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(initialState.elementPositions),
    };
    
    newState1.elements[0].x = 50;
    newState1.elementPositions.set('1', { x: 50, y: 10 });
    
    canvasHistory.push(newState1);
    
    const newState2: CanvasState = {
      elements: [...newState1.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(newState1.elementPositions),
    };
    
    newState2.elements[1].y = 200;
    newState2.elementPositions.set('2', { x: 100, y: 200 });
    
    canvasHistory.push(newState2);
    
    // Reset to initial state
    const resetResult = canvasHistory.reset();
    
    // Should get the initial state back
    expect(resetResult.elements[0].x).toBe(10);
    expect(resetResult.elements[1].y).toBe(100);
  });

  test('should truncate future history when pushing after undo', () => {
    // Push state 1
    const state1: CanvasState = {
      elements: [...initialState.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(initialState.elementPositions),
    };
    
    state1.elements[0].x = 50;
    state1.elementPositions.set('1', { x: 50, y: 10 });
    
    canvasHistory.push(state1);
    
    // Push state 2
    const state2: CanvasState = {
      elements: [...state1.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(state1.elementPositions),
    };
    
    state2.elements[1].y = 200;
    state2.elementPositions.set('2', { x: 100, y: 200 });
    
    canvasHistory.push(state2);
    
    // Undo to state 1
    const undoResult = canvasHistory.undo();
    
    // Push state 3 (should truncate history after state 1)
    // Create state3 from the current history state, not from state1 variable
    const state3: CanvasState = {
      elements: undoResult ? [...undoResult.elements] : [...initialState.elements],
      connections: undoResult ? [...undoResult.connections] : [...initialState.connections],
      elementPositions: undoResult ? new Map(undoResult.elementPositions) : new Map(initialState.elementPositions),
    };
    
    state3.elements[0].y = 75;
    state3.elementPositions.set('1', { x: 50, y: 75 });
    
    canvasHistory.push(state3);

    canvasHistory.undo();
    
    // Redo should now lead to state 3, not state 2
    const redoResult = canvasHistory.redo();
    
    // State 3 should be the result of redo
    expect(redoResult?.elements[0].y).toBe(75);
    expect(redoResult?.elements[1].y).toBe(100); // Not 200 from state 2
  });
});

describe('useCanvasHistory hook', () => {
  const createMockElement = (id: number, x: number, y: number): IElement => ({
    id,
    name: `Element ${id}`,
    type: `type-${id}`,
    x,
    y,
    inputs: [],
    outputs: [],
    internal_delay: 0,
    setup_time: 0
  });

  const createInitialState = (): CanvasState => {
    const elements = [
      createMockElement(1, 10, 10),
      createMockElement(2, 100, 100),
    ];
    const connections: IConnection[] = [];
    
    return {
      elements,
      connections,
      elementPositions: new Map(
        elements.map((el) => [el.id.toString(), { x: el.x ?? 0, y: el.y ?? 0 }])
      ),
    };
  };

  test('should initialize with correct state and functions', () => {
    const initialState = createInitialState();
    
    const { result } = renderHook(() => useCanvasHistory(initialState));
    
    // Hook should return expected functions and states
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(typeof result.current.pushState).toBe('function');
    expect(typeof result.current.undo).toBe('function');
    expect(typeof result.current.redo).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  test('should update canUndo and canRedo states correctly', () => {
    const initialState = createInitialState();
    
    const { result } = renderHook(() => useCanvasHistory(initialState));
    
    // Initially can't undo or redo
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    
    // Create a new state to push
    const newState: CanvasState = {
      elements: [...initialState.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(initialState.elementPositions),
    };
    
    newState.elements[0].x = 50;
    
    // Push new state
    act(() => {
      result.current.pushState(newState);
    });
    
    // Should be able to undo but not redo
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    
    // Undo
    act(() => {
      result.current.undo();
    });
    
    // Should be able to redo but not undo
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  test('should return correct state on undo and redo', () => {
    const initialState = createInitialState();
    
    const { result } = renderHook(() => useCanvasHistory(initialState));
    
    // Create a new state to push
    const newState: CanvasState = {
      elements: [...initialState.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(initialState.elementPositions),
    };
    
    newState.elements[0].x = 50;
    
    // Push new state
    act(() => {
      result.current.pushState(newState);
    });
    
    // Undo and check returned state
    let returnedState: CanvasState | undefined;
    act(() => {
      const undoResult = result.current.undo();
      returnedState = undoResult !== null ? undoResult : undefined;
    });
    
    expect(returnedState?.elements[0].x).toBe(10);
    
    // Redo and check returned state
    act(() => {
      const redoResult = result.current.redo();
      returnedState = redoResult !== null ? redoResult : undefined;
    });
    
    expect(returnedState?.elements[0].x).toBe(50);
  });

  test('should reset to initial state', () => {
    const initialState = createInitialState();
    
    const { result } = renderHook(() => useCanvasHistory(initialState));
    
    // Push multiple states
    const state1: CanvasState = {
      elements: [...initialState.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(initialState.elementPositions),
    };
    
    state1.elements[0].x = 50;
    
    act(() => {
      result.current.pushState(state1);
    });
    
    const state2: CanvasState = {
      elements: [...state1.elements],
      connections: [...initialState.connections],
      elementPositions: new Map(state1.elementPositions),
    };
    
    state2.elements[1].y = 200;
    
    act(() => {
      result.current.pushState(state2);
    });
    
    // Reset and check returned state
    let resetState: CanvasState | undefined;
    act(() => {
      resetState = result.current.reset();
    });
    
    expect(resetState?.elements[0].x).toBe(10);
    expect(resetState?.elements[1].y).toBe(100);
  });
});
