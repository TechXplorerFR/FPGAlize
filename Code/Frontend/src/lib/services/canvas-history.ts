import { useState, useCallback } from "react";
import { IConnection, type IElement } from "@/lib/types/types";

/**
 * CanvasState interface to represent the state of the canvas.
 * It includes elements, connections, and their positions.
 * @typedef {CanvasState}
 * @property {IElement[]} elements - Array of elements on the canvas.
 * @property {IConnection[]} connections - Array of connections between elements.
 * @property {Map<string, { x: number; y: number }>} elementPositions - Map of element IDs to their positions on the canvas.
 * @property {number} x - X coordinate of the element.
 * @property {number} y - Y coordinate of the element.
 */
export interface CanvasState {
  elements: IElement[];
  connections: IConnection[];
  elementPositions: Map<string, { x: number; y: number }>;
}

/**
 * CanvasHistory class to manage the history of canvas states.
 * It allows pushing new states, undoing and redoing actions, and resetting to the initial state.
 */
export class CanvasHistory {
  private history: CanvasState[] = [];
  private currentIndex: number = -1;
  private initialState: CanvasState;

  /**
   * Constructor for CanvasHistory.
   * Initializes the history with the initial state.
   * @param {CanvasState} initialState - The initial state of the canvas.
   */
  constructor(initialState: CanvasState) {
    this.initialState = this.cloneState(initialState);
    this.push(initialState);
  }

  /**
   * Push a new state to the history stack.
   * If the current index is not at the end of the history, truncate the history.
   * @param {CanvasState} state - The new state to push.
   */
  push(state: CanvasState): void {
    // If we're not at the end of the history, truncate it
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add the new state to history
    this.history.push(this.cloneState(state));
    this.currentIndex = this.history.length - 1;
  }

  /**
   * Undo the last action and return the previous state.
   * @returns {CanvasState | null} - The previous state or null if no more undo actions are available.
   */
  undo(): CanvasState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.cloneState(this.history[this.currentIndex]);
    }
    return null;
  }

  /**
   * Redo the last undone action and return the next state.
   * @returns {CanvasState | null} - The next state or null if no more redo actions are available.
   */
  redo(): CanvasState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.cloneState(this.history[this.currentIndex]);
    }
    return null;
  }

  /**
   * Reset the history to the initial state.
   * @returns {CanvasState} - The initial state of the canvas.
   */
  reset(): CanvasState {
    this.history = [];
    this.currentIndex = -1;
    return this.cloneState(this.initialState);
  }

  /**
   * Check if there are any undo actions available.
   * @returns {boolean} - True if undo is possible, false otherwise.
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if there are any redo actions available.
   * @returns {boolean} - True if redo is possible, false otherwise.
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clone the given state to avoid reference issues.
   * @param {CanvasState} state - The state to clone.
   * @returns {CanvasState} - A deep copy of the state.
   */
  private cloneState(state: CanvasState): CanvasState {
    return {
      elements: state.elements.map(el => ({ ...el })),  // Deep copy each element
      connections: state.connections.map(conn => ({ ...conn })),  // Deep copy each connection
      elementPositions: new Map(state.elementPositions),
    };
  }
}

/**
 * A custom hook to manage the history of canvas states.
 * It provides methods to push new states, undo and redo actions, and reset the history.
 * This hook uses the CanvasHistory class to manage the state history.
 * @param initialState - The initial state of the canvas.
 * @returns {Object} An object containing methods to manage canvas history.
 * @property {function} pushState - Push a new state to the history.
 * @property {function} undo - Undo the last action and return the previous state.
 * @property {function} redo - Redo the last undone action and return the next state.
 * @property {function} reset - Reset the history to the initial state.
 * @property {boolean} canUndo - Check if undo is possible.
 * @property {boolean} canRedo - Check if redo is possible.
 */
export function useCanvasHistory(initialState: CanvasState) : {
  pushState: (state: CanvasState) => void;
  undo: () => CanvasState | null;
  redo: () => CanvasState | null;
  reset: () => CanvasState;
  canUndo: boolean;
  canRedo: boolean;
} {
  const [canvasHistory] = useState(() => new CanvasHistory(initialState));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateButtons = useCallback(() => {
    setCanUndo(canvasHistory.canUndo());
    setCanRedo(canvasHistory.canRedo());
  }, [canvasHistory]);

  const pushState = useCallback(
    (state: CanvasState) => {
      canvasHistory.push(state);
      updateButtons();
    },
    [canvasHistory, updateButtons]
  );

  const undo = useCallback((): CanvasState | null => {
    const state = canvasHistory.undo();
    updateButtons();
    return state;
  }, [canvasHistory, updateButtons]);

  const redo = useCallback((): CanvasState | null => {
    const state = canvasHistory.redo();
    updateButtons();
    return state;
  }, [canvasHistory, updateButtons]);

  const reset = useCallback((): CanvasState => {
    const state = canvasHistory.reset();
    updateButtons();
    return state;
  }, [canvasHistory, updateButtons]);

  return {
    pushState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}
