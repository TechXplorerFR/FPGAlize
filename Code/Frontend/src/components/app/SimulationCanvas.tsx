import { useRef, useState, useEffect, useCallback } from "react";
import { Example, type Element } from "@/lib/types/types";
import { elementList } from "@/data/sample-elements";
import CanvasActionBar from "./CanvasActionBar";
import { getTheme } from "../theme-provider";
import { useCanvasHistory, type CanvasState } from "@/lib/services/canvas-history";

// Debounce helper function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function SimulationCanvas({
  activeTabId,
  examples,
  playing
}: {
  activeTabId: string;
  examples: Example[];
  playing: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<Element[]>(() => {
    const saved = sessionStorage.getItem("elements");
    return saved ? JSON.parse(saved) : elementList;
  });

  // Get theme inside component body
  const theme = getTheme();
  const isDarkTheme = theme === "dark";

  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 100%

  // Track when elements are actually being modified by user actions
  const [elementsModified, setElementsModified] = useState(false);

  // New state to track the impulses
  const [impulses, setImpulses] = useState<{ [key: string]: number }>({});

  // Initialize the canvas history
  const initialCanvasState: CanvasState = {
    elements,
    elementPositions: new Map(elements.map(el => [el.id.toString(), { x: el.x, y: el.y }])),
    panOffset,
    zoomLevel
  };
  
  const { pushState, undo, redo, reset, canUndo, canRedo } = useCanvasHistory(initialCanvasState);

  // Update history when canvas elements change (debounced to avoid too many history entries)
  const debouncedPushState = useCallback(
    debounce(() => {
      // Only push state if elements were actually modified by user actions
      if (elementsModified) {
        const currentElementPositions = new Map(
          elements.map(el => [el.id.toString(), { x: el.x, y: el.y }])
        );
        
        const currentState: CanvasState = {
          elements,
          elementPositions: currentElementPositions,
          panOffset,
          zoomLevel
        };
        
        pushState(currentState);
        // Reset the modified flag after pushing state
        setElementsModified(false);
      }
    }, 500), // 500ms debounce time
    [elements, panOffset, zoomLevel, pushState, elementsModified]
  );

  // Make sure state is pushed to history after relevant operations
  useEffect(() => {
    debouncedPushState();
  }, [elementsModified, debouncedPushState]);

  // Handle undo action
  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setElements(prevState.elements);
      setPanOffset(prevState.panOffset);
      setZoomLevel(prevState.zoomLevel);
    }
  }, [undo]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setElements(nextState.elements);
      setPanOffset(nextState.panOffset);
      setZoomLevel(nextState.zoomLevel);
    }
  }, [redo]);

  // Handle reset action
  const handleReset = useCallback(() => {
    const initialState = reset();
    setElements(initialState.elements);
    setPanOffset(initialState.panOffset);
    setZoomLevel(initialState.zoomLevel);
  }, [reset]);

  // Memoize drawCanvas to prevent recreation on each render
  const drawCanvas = useCallback(() => {
    const canvasRef = canvas.current;
    if (!canvasRef) return;
    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Apply transformations (scale and translate)
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw wires with horizontal and vertical paths
    ctx.strokeStyle = isDarkTheme ? "rgb(226,226,226)" : "black";
    ctx.lineWidth = 2 / zoomLevel; // Adjust line width based on zoom

    elements.forEach((el) => {
      el.connectedTo.forEach((connectedId) => {
        const connectedEl = elements.find((e) => e.id === connectedId);
        if (connectedEl) {
          const startX = el.x + 25;
          const startY = el.y + 25;
          const endX = connectedEl.x + 25;
          const endY = connectedEl.y + 25;

          // Draw the wire path (horizontal and then vertical)
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          if (startX !== endX) ctx.lineTo(endX, startY); // Horizontal segment
          if (startY !== endY) ctx.lineTo(endX, endY); // Vertical segment
          ctx.stroke();

          // Draw the impulse (as a blue circle) along the wire
          const impulsePosition: number = impulses[`${el.id}-${connectedId}`];

          if (impulsePosition !== undefined) {
            let impulseX = startX;
            let impulseY = startY;

            const horizontalDistance = Math.abs(endX - startX);
            const verticalDistance = Math.abs(endY - startY);
            const totalDistance = horizontalDistance + verticalDistance;

            if (impulsePosition <= horizontalDistance / totalDistance) {
              // Move along the horizontal segment
              impulseX =
                startX +
                (endX - startX) *
                  ((impulsePosition * totalDistance) / horizontalDistance);
            } else {
              // Move along the vertical segment
              impulseX = endX;
              impulseY =
                startY +
                (endY - startY) *
                  ((impulsePosition * totalDistance - horizontalDistance) /
                    verticalDistance);
            }

            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(impulseX, impulseY, 5, 0, Math.PI * 2);
            ctx.fill();

            // When impulse reaches the destination
            if (impulsePosition >= 0.9) {
              // console.log(`Succeeded to go to ${connectedId}`);
            }
          }
        }
      });
    });

    // Draw elements
    elements.forEach((el) => {
      ctx.fillStyle = "red";
      ctx.fillRect(el.x, el.y, 50, 50);

      ctx.fillStyle = "white";
      ctx.font = `${20 / zoomLevel}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(el.id.toString(), el.x + 25, el.y + 25);
    });

    ctx.restore();
  }, [elements, panOffset, zoomLevel, impulses, isDarkTheme]);

  // Store elements in sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("elements", JSON.stringify(elements));
  }, [elements]);

  // Draw canvas whenever necessary
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, canvasSize]);

  useEffect(() => {
    // Debounced resize function to prevent excessive resizing
    const debouncedResize = debounce(() => {
      const canvasRef = canvas.current;
      const containerElement = containerRef.current;

      if (canvasRef && containerElement) {
        // Get the current size of the container
        const { width, height } = containerElement.getBoundingClientRect();

        // Only update if dimensions actually changed
        if (width !== canvasSize.width || height !== canvasSize.height) {
          // Update the canvas dimensions
          canvasRef.width = width;
          canvasRef.height = height;

          // Update the state (this will trigger redrawing)
          setCanvasSize({ width, height });
        }
      }
    }, 10); // 100ms debounce time

    const resizeObserver = new ResizeObserver(() => {
      debouncedResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      // Initial size setup
      debouncedResize();
    }

    window.addEventListener("resize", debouncedResize);

    return () => {
      if (containerRef.current) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", debouncedResize);
    };
  }, [canvasSize.width, canvasSize.height]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Move impulses along the wires
      setImpulses((prev) => {
        const newImpulses: { [key: string]: number } = {};

        // Move the impulses along their respective paths
        Object.entries(prev).forEach(([key, position]) => {
          const newPosition =  position + 0.05; // Move the impulse along the wire
          if (newPosition < 1) {
            newImpulses[key] = playing ? newPosition : position;
          }
        });

        // Add new impulses for wires that are not yet moving
        elements.forEach((el) => {
          el.connectedTo.forEach((connectedId) => {
            const key = `${el.id}-${connectedId}`; // Use the string key to track impulse for wire
            if (!(key in prev)) {
              newImpulses[key] = 0; // Start new impulse from the beginning of the wire
            }
          });
        });

        return newImpulses;
      });
    }, 50); // impulses speed

    return () => clearInterval(interval);
  }, [elements, playing]);

  const handleMouseDown = (event: React.MouseEvent) => {
    const { offsetX, offsetY, button } = event.nativeEvent;

    if (button === 1 || button === 2) {
      // Middle or right-click to start panning
      setIsPanning(true);
      setStartPan({ x: offsetX, y: offsetY });
      // Remove the setElementsModified call from here
      return;
    }

    // Convert screen coordinates to canvas coordinates
    const canvasX = (offsetX - panOffset.x) / zoomLevel;
    const canvasY = (offsetY - panOffset.y) / zoomLevel;

    const element = elements.find(
      (el) =>
        canvasX >= el.x &&
        canvasX <= el.x + 50 &&
        canvasY >= el.y &&
        canvasY <= el.y + 50
    );

    if (element) {
      setDraggingElement(element.id);
      // Remove the setElementsModified call from here
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isPanning) {
      const { offsetX, offsetY } = event.nativeEvent;
      setPanOffset((prev) => ({
        x: prev.x + (offsetX - startPan.x),
        y: prev.y + (offsetY - startPan.y),
      }));
      setStartPan({ x: offsetX, y: offsetY });
      // No need to set elementsModified here as it was set in mouseDown
      return;
    }

    if (draggingElement === null) return;
    const { offsetX, offsetY } = event.nativeEvent;

    // Convert screen coordinates to canvas coordinates
    const canvasX = (offsetX - panOffset.x) / zoomLevel;
    const canvasY = (offsetY - panOffset.y) / zoomLevel;

    setElements((prev) =>
      prev.map((el) =>
        el.id === draggingElement
          ? {
              ...el,
              x: canvasX - 25, // Center element on cursor
              y: canvasY - 25,
            }
          : el
      )
    );
    // No need to set elementsModified here as it was set in mouseDown
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (event.button === 1 || event.button === 2) {
      setIsPanning(false);
      // Set elements modified when panning ends
      if (isPanning) {
        setElementsModified(true);
      }
    }
    
    // Set elements modified when dragging ends
    if (draggingElement !== null) {
      setElementsModified(true);
    }
    
    // To remove
    console.log(activeTabId, examples);
    // ---------------
    setDraggingElement(null);
  };

  // Modified wheel handler for both zoom and pan
  const handleWheel = (event: React.WheelEvent) => {
    // event.preventDefault(); // Prevent default scrolling behavior

    // Check if Ctrl key is pressed for zooming
    if (event.ctrlKey) {
      // Set elements modified when zooming
      setElementsModified(true);
      const delta = -event.deltaY * 0.01; // Adjust sensitivity
      const newZoom = Math.max(0.1, Math.min(5, zoomLevel + delta)); // Limit zoom between 10% and 500%

      // Get mouse position relative to canvas
      const rect = canvas.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Calculate zoom center point (where mouse is pointing)
      const mouseCanvasX = (mouseX - panOffset.x) / zoomLevel;
      const mouseCanvasY = (mouseY - panOffset.y) / zoomLevel;

      // Calculate new pan offset to keep the point under mouse fixed
      const newPanOffsetX = mouseX - mouseCanvasX * newZoom;
      const newPanOffsetY = mouseY - mouseCanvasY * newZoom;

      setPanOffset({
        x: newPanOffsetX,
        y: newPanOffsetY,
      });

      setZoomLevel(newZoom);
    } else {
      // Set elements modified when panning with wheel
      setElementsModified(true);
      // Regular panning with wheel
      setPanOffset((prev) => ({
        x: prev.x - event.deltaX,
        y: prev.y - event.deltaY,
      }));
    }
  };

  // Function to handle zoom from the action bar
  const handleZoomChange = (newZoomPercent: number) => {
    // Set elements modified when changing zoom from action bar
    setElementsModified(true);
    const newZoom = newZoomPercent / 100;
    setZoomLevel(newZoom);
  };

  // Function to reset zoom
  const resetZoom = () => {
    // Set elements modified when resetting zoom
    setElementsModified(true);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="w-full h-[88vh] bg-gray-100">
      <canvas
        ref={canvas}
        className="border border-neutral-400 dark:border-neutral-900 bg-white dark:bg-neutral-900 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="relative">
        <div className="absolute bottom-2 left-6">
          <CanvasActionBar
            zoom={Math.round(zoomLevel * 100)}
            onZoomChange={(delta) =>
              handleZoomChange(Math.round(zoomLevel * 100) + delta)
            }
            onResetZoom={resetZoom}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
      </div>
    </div>
  );
}
