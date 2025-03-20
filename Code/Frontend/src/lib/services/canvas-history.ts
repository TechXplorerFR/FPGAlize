import { useState, useCallback } from 'react';
import { type Element } from "@/lib/types/types";

export interface CanvasState {
  elements: Element[];
  elementPositions: Map<string, { x: number, y: number }>;
  panOffset: { x: number, y: number };
  zoomLevel: number;
}

class CanvasHistory {
  private history: CanvasState[] = [];
  private currentIndex: number = -1;
  private initialState: CanvasState;

  constructor(initialState: CanvasState) {
    this.initialState = this.cloneState(initialState);
    this.push(initialState);
  }

  push(state: CanvasState): void {
    // If we're not at the end of the history, truncate it
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Add the new state to history
    this.history.push(this.cloneState(state));
    this.currentIndex = this.history.length - 1;
  }

  undo(): CanvasState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.cloneState(this.history[this.currentIndex]);
    }
    return null;
  }

  redo(): CanvasState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.cloneState(this.history[this.currentIndex]);
    }
    return null;
  }

  reset(): CanvasState {
    return this.cloneState(this.initialState);
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  private cloneState(state: CanvasState): CanvasState {
    return {
      elements: [...state.elements],
      elementPositions: new Map(state.elementPositions),
      panOffset: { ...state.panOffset },
      zoomLevel: state.zoomLevel
    };
  }
}

export function useCanvasHistory(initialState: CanvasState) {
  const [canvasHistory] = useState(() => new CanvasHistory(initialState));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  const updateButtons = useCallback(() => {
    setCanUndo(canvasHistory.canUndo());
    setCanRedo(canvasHistory.canRedo());
  }, [canvasHistory]);
  
  const pushState = useCallback((state: CanvasState) => {
    canvasHistory.push(state);
    updateButtons();
  }, [canvasHistory, updateButtons]);
  
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
    canRedo
  };
}
