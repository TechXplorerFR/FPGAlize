import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  Example,
  type IElement,
  type IConnection,
  type ConnectionEndpoints,
} from "@/lib/types/types";
import CanvasActionBar from "./CanvasActionBar";
import { getTheme } from "../theme-provider";
import {
  useCanvasHistory,
  type CanvasState,
} from "@/lib/services/canvas-history";
import { toast } from "sonner";

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
  playing,
}: {
  activeTabId: string;
  examples: Example[];
  playing: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<IElement[]>([]);
  const [connections, setConnections] = useState<IConnection[]>([]);
  const [connectionEndpoints, setConnectionEndpoints] = useState<
    ConnectionEndpoints[]
  >([]);

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

  // Add a new state to store preloaded images
  const [componentImages, setComponentImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  // Add a new state for image dimensions
  const [imageDimensions, setImageDimensions] = useState<{
    [key: string]: { width: number; height: number };
  }>({});

  // Maximum size for component boundaries
  const MAX_COMPONENT_SIZE = 90;

  // Define a mapping of element types to image filenames - memoize to prevent recreating on each render
  const elementTypeToImageMap = useMemo(
    () => ({
      module_input: "module_input",
      module_output: "module_output",
      clk: "clk",
      DFF_NE: "DFF_En",
      DFF: "DFF_noEn",
      LUT1: "LUT_1",
      LUT2: "LUT_2",
      LUT3: "LUT_3",
      LUT4: "LUT_4",
      and: "and",
      nand: "nand",
      nor: "nor",
      nxor: "nxor",
      or: "or",
      xor: "xor",
    }),
    []
  ); // Empty dependency array as this mapping never changes

  // Preload images when component mounts
  useEffect(() => {
    const imageCache: { [key: string]: HTMLImageElement } = {};
    const dimensionsCache: { [key: string]: { width: number; height: number } } = {};
    const themePrefix = isDarkTheme ? "d" : "w";

    // Create a list of all images to load
    const imagePromises = Object.entries(elementTypeToImageMap).map(
      ([type, imageName]) => {
        // Fix path to use assets in public directory
        const path = `${
          import.meta.env.BASE_URL || ""
        }images/components/${themePrefix}_${imageName}.png`;

        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCache[type] = img;
            
            // Calculate dimensions that preserve aspect ratio within MAX_COMPONENT_SIZE boundary
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let width, height;
            
            if (aspectRatio >= 1) {
              // Image is wider or square
              width = MAX_COMPONENT_SIZE;
              height = MAX_COMPONENT_SIZE / aspectRatio;
            } else {
              // Image is taller
              height = MAX_COMPONENT_SIZE;
              width = MAX_COMPONENT_SIZE * aspectRatio;
            }
            
            dimensionsCache[type] = { width, height };
            resolve();
          };
          img.onerror = (e) => {
            toast.error(`Failed to load image: ${path}`);
            console.error(`Failed to load image: ${path}`, e);
            resolve(); // Resolve anyway to not block other images
          };
          img.src = path;
        });
      }
    );

    // When all images are loaded, update the state
    Promise.all(imagePromises).then(() => {
      setComponentImages(imageCache);
      setImageDimensions(dimensionsCache);
    });
  }, [isDarkTheme, elementTypeToImageMap]); // Reload images when theme changes

  // Initialize the canvas history
  const initialCanvasState: CanvasState = {
    elements: [],
    connections: [],
    elementPositions: new Map(),
  };

  const { pushState, undo, redo, reset, canUndo, canRedo } =
    useCanvasHistory(initialCanvasState);

  // Update history when canvas elements change (debounced to avoid too many history entries)
  const debouncedPushState = useCallback(
    debounce(() => {
      // Only push state if elements were actually modified by user actions
      if (elementsModified) {
        const currentState: CanvasState = {
          elements,
          connections,
          elementPositions: new Map(
            elements.map((el) => [
              el.id.toString(),
              { x: el.x ?? 0, y: el.y ?? 0 },
            ])
          ),
        };

        pushState(currentState);
        // Reset the modified flag after pushing state
        setElementsModified(false);
      }
    }, 500), // 500ms debounce time
    [elements, connections, pushState, elementsModified]
  );

  // Load data from active example
  useEffect(() => {
    const activeExample = examples.find(
      (example) =>
        example.jsonOutput &&
        activeTabId.includes(example.originalVerilogFile.name.split(".")[0])
    );

    if (activeExample && activeExample.jsonOutput) {
      // Simple positioning strategy - distribute elements in a grid
      const positionedElements = activeExample.jsonOutput.elements.map(
        (el, index) => {
          const row = Math.floor(index / 4); // 4 elements per row
          const col = index % 4;

          return {
            ...el,
            x: 100 + col * 150, // Space elements horizontally
            y: 100 + row * 100, // Space elements vertically
          };
        }
      );
      setElements(positionedElements);
      setConnections(activeExample.jsonOutput.connections);

      // Reset view when loading a new example
      resetZoom();

      // Center the view on the elements
      centerViewOnElements(positionedElements);
    } else {
      toast.warning("No active example found");
      console.warn("No active example found for:", activeTabId);
      // Clear the canvas if no example is selected
      setElements([]);
      setConnections([]);
    }
  }, [activeTabId, examples]);

  // Helper function to center the view on elements
  const centerViewOnElements = useCallback((els: IElement[]) => {
    if (els.length === 0 || !containerRef.current) return;

    // Calculate bounds
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    els.forEach((el) => {
      const x = el.x ?? 0;
      const y = el.y ?? 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 50); // Assuming elements are 50x50
      maxY = Math.max(maxY, y + 50);
    });

    // Calculate center of elements and container
    const elementsWidth = maxX - minX;
    const elementsHeight = maxY - minY;
    const elementsCenterX = minX + elementsWidth / 2;
    const elementsCenterY = minY + elementsHeight / 2;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Set pan offset to center elements
    setPanOffset({
      x: containerWidth / 2 - elementsCenterX,
      y: containerHeight / 2 - elementsCenterY,
    });
  }, []);

  // Make sure state is pushed to history after relevant operations
  useEffect(() => {
    debouncedPushState();
  }, [elementsModified, debouncedPushState]);

  // Handle undo action
  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setElements(prevState.elements as IElement[]);
      setConnections(prevState.connections);
    }
  }, [undo]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setElements(nextState.elements as IElement[]);
      setConnections(nextState.connections);
    }
  }, [redo]);

  // Handle reset action
  const handleReset = useCallback(() => {
    const initialState = reset();
    setElements(initialState.elements as IElement[]);
    setConnections(initialState.connections);
  }, [reset]);

  // Update connection endpoints when elements or connections change
  useEffect(() => {
    if (elements.length === 0 || connections.length === 0) {
      setConnectionEndpoints([]);
      return;
    }

    const newConnectionEndpoints: ConnectionEndpoints[] = [];

    connections.forEach((connection) => {
      // Find source element (element that has this connection name in its outputs)
      const sourceElement = elements.find(
        (el) =>
          el.outputs &&
          el.outputs.some((output) => output.wireName === connection.name)
      );

      // Find destination element (element that has this connection name in its inputs)
      const destElement = elements.find(
        (el) =>
          el.inputs &&
          el.inputs.some((input) => input.wireName === connection.name)
      );

      if (sourceElement && destElement) {
        // Find the specific output and input ports that use this connection
        const sourceOutput = sourceElement.outputs.find(
          (output) => output.wireName === connection.name
        );

        const destInput = destElement.inputs.find(
          (input) => input.wireName === connection.name
        );

        // Use the port names (or default to empty string if null)
        const sourcePort = sourceOutput?.outputName || "";
        const destPort = destInput?.inputName || "";

        newConnectionEndpoints.push({
          connection,
          sourceElement,
          destElement,
          sourcePort,
          destPort,
        });
      }
    });
    setConnectionEndpoints(newConnectionEndpoints);
  }, [elements, connections]);

  // Get connection endpoints based on element and connection
  const getConnectionPoints = useCallback((endpoint: ConnectionEndpoints) => {
    const { sourceElement, destElement } = endpoint;

    // Calculate element center points for connections
    const startX = (sourceElement.x ?? 0) + 25;
    const startY = (sourceElement.y ?? 0) + 25;
    const endX = (destElement.x ?? 0) + 25;
    const endY = (destElement.y ?? 0) + 25;

    return {
      startX,
      startY,
      endX,
      endY,
    };
  }, []);

  // Memoize drawCanvas to prevent recreation on each render
  const drawCanvas = useCallback(() => {
    const canvasRef = canvas.current;
    if (!canvasRef) return;
    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    // Clear with the appropriate background color
    ctx.fillStyle = isDarkTheme ? "#171717" : "#ffffff";
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

    // Apply transformations (scale and translate)
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Debug info
    if (elements.length === 0) {
      ctx.restore();
      ctx.fillStyle = isDarkTheme ? "#ffffff" : "#000000";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "No elements to display. Select an example from the drawer.",
        canvasRef.width / 2,
        canvasRef.height / 2
      );
      return;
    }

    // Draw connections with horizontal and vertical paths
    ctx.strokeStyle = isDarkTheme ? "rgb(226,226,226)" : "black";
    ctx.lineWidth = 2 / zoomLevel; // Adjust line width based on zoom

    connectionEndpoints.forEach((endpoint) => {
      const { startX, startY, endX, endY } = getConnectionPoints(endpoint);
      const { connection } = endpoint;

      // Draw the wire path (horizontal and then vertical)
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      if (startX !== endX) ctx.lineTo(endX, startY); // Horizontal segment
      if (startY !== endY) ctx.lineTo(endX, endY); // Vertical segment
      ctx.stroke();

      // Draw the impulse (as a blue circle) along the wire
      const impulsePosition: number = impulses[connection.name];

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

        ctx.fillStyle = connection.color || "blue";
        ctx.beginPath();
        ctx.arc(impulseX, impulseY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw elements
    elements.forEach((el) => {
      // Get the image for this element type directly
      const image = componentImages[el.type];

      // If the image is loaded, draw it; otherwise, fall back to colored rectangle
      if (image) {
        // Get the calculated dimensions that preserve aspect ratio
        const dimensions = imageDimensions[el.type] || { width: 50, height: 50 };
        
        // Center the image within the element's 50x50 area
        const x = (el.x ?? 0) + (50 - dimensions.width) / 2;
        const y = (el.y ?? 0) + (50 - dimensions.height) / 2;
        
        // Draw the image with proper aspect ratio
        ctx.drawImage(image, x, y, dimensions.width, dimensions.height);
      }
      // else {
      //   // Fall back to original colored rectangle logic
      //   let elementColor = "lightcoral";
      //   if (el.type === "module_input") {
      //     elementColor = "lightgreen";
      //   } else if (el.type === "module_output") {
      //     elementColor = "lightblue";
      //   } else if (el.type === "DFF") {
      //     elementColor = "orange";
      //   }

      //   ctx.fillStyle = elementColor;
      //   ctx.fillRect(el.x ?? 0, el.y ?? 0, 50, 50);
      // }

      // Draw labels (keep existing text rendering)
      // ctx.fillStyle = isDarkTheme ? "white" : "black";
      // ctx.font = `${Math.max(8, 16 / zoomLevel)}px Arial`;
      // ctx.textAlign = "center";
      // ctx.textBaseline = "middle";
      // ctx.fillText(el.name, (el.x ?? 0) + 25, (el.y ?? 0) + 25);
    });

    ctx.restore();
  }, [
    elements,
    connectionEndpoints,
    panOffset,
    zoomLevel,
    impulses,
    isDarkTheme,
    getConnectionPoints,
    componentImages,
    imageDimensions, // Add imageDimensions to dependencies
  ]);

  // Store elements in sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("elements", JSON.stringify(elements));
    sessionStorage.setItem("connections", JSON.stringify(connections));
  }, [elements, connections]);

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
          const newPosition = position + 0.05; // Move the impulse along the wire
          if (newPosition < 1) {
            newImpulses[key] = playing ? newPosition : position;
          }
        });

        // Add new impulses for connections that are not yet moving
        connections.forEach((connection) => {
          const connectionName = connection.name;
          if (!(connectionName in prev)) {
            newImpulses[connectionName] = 0; // Start new impulse from the beginning of the wire
          }
        });

        return newImpulses;
      });
    }, 50); // impulses speed

    return () => clearInterval(interval);
  }, [connections, playing]);

  const handleMouseDown = (event: React.MouseEvent) => {
    const { offsetX, offsetY, button } = event.nativeEvent;

    if (button === 1 || button === 2) {
      // Middle or right-click to start panning
      setIsPanning(true);
      setStartPan({ x: offsetX, y: offsetY });
      return;
    }

    // Convert screen coordinates to canvas coordinates
    const canvasX = (offsetX - panOffset.x) / zoomLevel;
    const canvasY = (offsetY - panOffset.y) / zoomLevel;

    const element = elements.find(
      (el) =>
        canvasX >= (el.x ?? 0) &&
        canvasX <= (el.x ?? 0) + 50 &&
        canvasY >= (el.y ?? 0) &&
        canvasY <= (el.y ?? 0) + 50
    );

    if (element) {
      setDraggingElement(element.id);
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

    setDraggingElement(null);
  };

  // Modified wheel handler for both zoom and pan
  const handleWheel = (event: React.WheelEvent) => {
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
    <div
      ref={containerRef}
      className="w-full h-[88vh] bg-gray-100 dark:bg-neutral-800"
    >
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
