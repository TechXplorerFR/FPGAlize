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
import {
  calculatePortPosition,
} from "@/lib/config/element-ports";
import {
  calculateConnectionPath,
  getPointAlongPath,
  type EdgePoint,
} from "@/lib/utils/connection-router";

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

// Calculate exact edge point based on port direction and element dimensions
function calculateEdgePoint(
  x: number,
  y: number,
  direction: "left" | "right" | "top" | "bottom",
  elementX: number,
  elementY: number,
  width: number,
  height: number
): { x: number; y: number } {
  switch (direction) {
    case "left":
      return { x: elementX, y };
    case "right":
      return { x: elementX + width, y };
    case "top":
      return { x, y: elementY };
    case "bottom":
      return { x, y: elementY + height };
    default:
      return { x, y };
  }
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

  // Add state to track if element was actually dragged vs just clicked
  const [dragStartPos, setDragStartPos] = useState<{ x: number, y: number } | null>(null);
  const [elementWasDragged, setElementWasDragged] = useState(false);

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
      module_input_en: "module_input_en",
      module_output: "module_output",
      module_output_en: "module_output_en",
      clk: "clk",
      DFF_NE: "DFF_noEn",
      DFF: "DFF_En",
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
    const dimensionsCache: {
      [key: string]: { width: number; height: number };
    } = {};
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

  // Get connection endpoints based on element and connection - enhanced to include path calculation
  const getConnectionPoints = useCallback(
    (endpoint: ConnectionEndpoints) => {
      const { sourceElement, destElement, sourcePort, destPort } = endpoint;

      // Get the dimensions for source and target elements
      const sourceDimensions = imageDimensions[sourceElement.type] || {
        width: 50,
        height: 50,
      };
      const destDimensions = imageDimensions[destElement.type] || {
        width: 50,
        height: 50,
      };

      // Calculate port positions with directions using the enhanced function
      const startPortInfo = calculatePortPosition(
        sourceElement,
        sourcePort,
        "output",
        sourceDimensions
      );

      const endPortInfo = calculatePortPosition(
        destElement,
        destPort,
        "input",
        destDimensions
      );

      // Use calculated positions or fall back to element centers
      const startX =
        startPortInfo?.x ?? (sourceElement.x ?? 0) + sourceDimensions.width / 2;
      const startY =
        startPortInfo?.y ??
        (sourceElement.y ?? 0) + sourceDimensions.height / 2;
      const endX =
        endPortInfo?.x ?? (destElement.x ?? 0) + destDimensions.width / 2;
      const endY =
        endPortInfo?.y ?? (destElement.y ?? 0) + destDimensions.height / 2;

      // Get port directions
      const sourceDirection = startPortInfo?.direction || "right";
      const destDirection = endPortInfo?.direction || "left";

      // Calculate exact edge points where connections should start/end
      const sourceEdge = calculateEdgePoint(
        startX,
        startY,
        sourceDirection,
        sourceElement.x ?? 0,
        sourceElement.y ?? 0,
        sourceDimensions.width,
        sourceDimensions.height
      );

      const destEdge = calculateEdgePoint(
        endX,
        endY,
        destDirection,
        destElement.x ?? 0,
        destElement.y ?? 0,
        destDimensions.width,
        destDimensions.height
      );

      // Calculate the connection path using the router utility
      const sourceEdgeWithDirection: EdgePoint = {
        ...sourceEdge,
        direction: sourceDirection,
      };

      const destEdgeWithDirection: EdgePoint = {
        ...destEdge,
        direction: destDirection,
      };

      // Generate the complete path for the connection
      const path = calculateConnectionPath(
        sourceEdgeWithDirection,
        destEdgeWithDirection
      );

      return {
        startX,
        startY,
        endX,
        endY,
        sourceDirection,
        destDirection,
        sourceEdge,
        destEdge,
        path,
      };
    },
    [imageDimensions]
  );

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

    // Draw connections with path-based routing
    ctx.strokeStyle = isDarkTheme ? "rgb(226,226,226)" : "black";
    ctx.lineWidth = 2 / zoomLevel; // Adjust line width based on zoom

    connectionEndpoints.forEach((endpoint) => {
      const {
        startX,
        startY,
        endX,
        endY,
        sourceDirection,
        destDirection,
        sourceEdge,
        destEdge,
        path,
      } = getConnectionPoints(endpoint);

      const { connection } = endpoint;

      // Draw the connection path
      ctx.beginPath();

      // Draw all segments of the path
      if (path && path.length > 1) {
        ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
      } else {
        // Fallback to direct line if path calculation failed
        ctx.moveTo(sourceEdge.x, sourceEdge.y);
        ctx.lineTo(destEdge.x, destEdge.y);
      }

      ctx.stroke();

      // Draw the impulse along the calculated path
      const impulsePosition: number = impulses[connection.name];
      if (impulsePosition !== undefined && path && path.length > 1) {
        // Get position along the path based on the impulse percentage
        const impulsePoint = getPointAlongPath(path, impulsePosition);

        // Draw the impulse
        ctx.fillStyle = connection.color || "blue";
        ctx.beginPath();
        ctx.arc(impulsePoint.x, impulsePoint.y, 5 / zoomLevel, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw elements
    elements.forEach((el) => {
      // Get the image for this element type directly
      const image = componentImages[el.type];

      // If the image is loaded, draw it
      if (image) {
        // Get the calculated dimensions that preserve aspect ratio
        const dimensions = imageDimensions[el.type] || {
          width: 50,
          height: 50,
        };

        // Center the image within the element's area
        const x = (el.x ?? 0) + (50 - dimensions.width) / 2;
        const y = (el.y ?? 0) + (50 - dimensions.height) / 2;

        // Draw the image with proper aspect ratio
        ctx.drawImage(image, x, y, dimensions.width, dimensions.height);
      }
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
    imageDimensions,
  ]);

  // Store elements in sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("elements", JSON.stringify(elements));
    sessionStorage.setItem("connections", JSON.stringify(connections));
  }, [elements, connections]);

  // Draw canvas whenever necessary
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, canvasSize, elements]); // Added elements as a dependency

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

  // New state to track module_output elements that have received signals
  const [activatedOutputs, setActivatedOutputs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      // Move impulses along the wires
      setImpulses((prev) => {
        const newImpulses: { [key: string]: number } = {};

        // Move the impulses along their respective paths
        Object.entries(prev).forEach(([key, position]) => {
          const newPosition = position + 0.05; // Move the impulse along the wire
          
          // Check if the impulse is near the end of the wire and needs to activate an output
          if (newPosition > 0.95 && newPosition < 1) {
            // Find if this connection leads to a module_output
            const destElement = elements.find(
              (el) =>
                el.inputs &&
                el.inputs.some((input) => input.wireName === key) &&
                (el.type === 'module_output' || el.type === 'module_output_en')
            );
            
            if (destElement) {
              // Track this output as activated
              setActivatedOutputs(prevActivated => {
                const newActivated = new Set(prevActivated);
                newActivated.add(destElement.id.toString());
                return newActivated;
              });
            }
          }
          
          if (newPosition < 1) {
            newImpulses[key] = playing ? newPosition : position;
          }
        });

        // Only add new impulses if playing
        if (playing) {
          // Add new impulses for connections that are not yet moving
          connections.forEach((connection) => {
            const connectionName = connection.name;
            if (!(connectionName in prev)) {
              // Find source element of this connection
              const sourceElement = elements.find(
                (el) =>
                  el.outputs &&
                  el.outputs.some((output) => output.wireName === connectionName)
              );
              
              // Only add impulses if the source is not a disabled input
              if (sourceElement && sourceElement.type === 'module_input') {
                // Don't create impulse for disabled input
                return;
              } else {
                newImpulses[connectionName] = 0; // Start new impulse from the beginning
              }
            }
          });
        }

        return newImpulses;
      });
    }, 50); // impulses speed

    return () => clearInterval(interval);
  }, [connections, playing, elements]); // Added elements as dependency
  
  // Modified effect to handle module_output state based on active signals AND activation history
  useEffect(() => {
    setElements((prevElements) => {
      // Only update if there's a change needed
      let needsUpdate = false;
      
      const updatedElements = prevElements.map(element => {
        // Only check module_output and module_output_en elements
        if (element.type !== 'module_output' && element.type !== 'module_output_en') {
          return element;
        }
        
        // Find the connection for this output
        const inputConnection = element.inputs[0]?.wireName;
        if (!inputConnection) {
          return element;
        }
        
        // Check if there's an active impulse on this connection OR if this output was previously activated
        const hasActiveImpulse = impulses[inputConnection] !== undefined;
        const wasActivated = activatedOutputs.has(element.id.toString());
        
        // If playing is false, reset activated outputs
        const shouldBeEnabled = playing ? (hasActiveImpulse || wasActivated) : hasActiveImpulse;
        
        // Determine the correct type based on impulse state and activation history
        const correctType = shouldBeEnabled ? 'module_output_en' : 'module_output';
        
        // Only update if the type needs to change
        if (element.type !== correctType) {
          needsUpdate = true;
          return {
            ...element,
            type: correctType
          };
        }
        
        return element;
      });
      
      // Only return new array if something changed
      return needsUpdate ? updatedElements : prevElements;
    });
  }, [impulses, activatedOutputs, playing]);

  // Add an effect to reset activated outputs when switching to non-playing state
  useEffect(() => {
    if (!playing) {
      setActivatedOutputs(new Set());
    }
  }, [playing]);

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

    // Save the starting position of the click
    setDragStartPos({ x: canvasX, y: canvasY });
    // Reset the drag flag
    setElementWasDragged(false);

    const element = elements.find(
      (el) => {
        // Get the actual dimensions for proper hit detection
        const dimensions = imageDimensions[el.type] || { width: 50, height: 50 };
        return (
          canvasX >= (el.x ?? 0) &&
          canvasX <= (el.x ?? 0) + dimensions.width &&
          canvasY >= (el.y ?? 0) &&
          canvasY <= (el.y ?? 0) + dimensions.height
        );
      }
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

    // Check if we've moved enough to consider this a drag
    if (dragStartPos && 
        (Math.abs(canvasX - dragStartPos.x) > 5 || 
         Math.abs(canvasY - dragStartPos.y) > 5)) {
      setElementWasDragged(true);
    }

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
      return; // Exit early for non-left clicks
    }

    // Check if we clicked an element but didn't drag it
    if (draggingElement !== null && !elementWasDragged && event.button === 0) {
      // Find the clicked element
      const clickedElement = elements.find(el => el.id === draggingElement);
      
      // If the clicked element is a module_input or module_input_en, toggle its type
      if (clickedElement && 
          (clickedElement.type === 'module_input' || clickedElement.type === 'module_input_en')) {
        const newType = clickedElement.type === 'module_input' ? 'module_input_en' : 'module_input';
        
        setElements((prev) =>
          prev.map((el) =>
            el.id === clickedElement.id
              ? {
                  ...el,
                  type: newType,
                }
              : el
          )
        );
        
        // Mark elements as modified
        setElementsModified(true);
        
        // Force an immediate redraw
        setTimeout(() => drawCanvas(), 0);
      }
    }

    // Set elements modified when dragging ends
    if (draggingElement !== null && elementWasDragged) {
      setElementsModified(true);
    }

    // Reset drag state
    setDraggingElement(null);
    setDragStartPos(null);
    setElementWasDragged(false);
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
