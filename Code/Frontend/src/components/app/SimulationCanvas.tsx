import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Example, type IElement, type IConnection } from "@/lib/types/types";
import CanvasActionBar from "./CanvasActionBar";
import { getTheme } from "../theme-provider";
import { useCanvasHistory } from "@/lib/services/canvas-history";
import { toast } from "sonner";

// Helper type for wire segments
type Point = {
  x: number;
  y: number;
};

// Add a type for signal propagation
type Signal = {
  connectionName: string;
  position: number; // 0-1 to represent progress along the wire (percentage)
  points: Point[]; // The path points this signal is following
  totalLength: number; // Total length of the path
  createdAt: number; // Timestamp when signal was created
  sourceName: string; // Name of source element
  destName: string; // Name of destination element
};

// Function to calculate orthogonal path with corners
const calculateOrthogonalPath = (startX: number, startY: number, endX: number, endY: number): Point[] => {
  const path: Point[] = [];
  
  // Add the starting point
  path.push({ x: startX, y: startY });
  
  // Calculate the midpoint X
  const midX = startX + (endX - startX) / 2;
  
  // Add the first corner point
  path.push({ x: midX, y: startY });
  
  // Add the second corner point
  path.push({ x: midX, y: endY });
  
  // Add the end point
  path.push({ x: endX, y: endY });
  
  return path;
};

// Add a function to automatically arrange elements based on connections
const arrangeElements = (elements: IElement[], connections: IConnection[]): IElement[] => {
  // Clone the elements to avoid modifying the original array
  const arrangedElements = [...elements];
  
  // If there are no elements, return empty array
  if (arrangedElements.length === 0) return arrangedElements;
  
  // Step 1: Create a dependency graph to determine element order
  const dependencyGraph: Record<number, number[]> = {};
  arrangedElements.forEach(el => {
    dependencyGraph[el.id] = [];
  });
  
  // Add connections to dependency graph
  connections.forEach(conn => {
    const sourceElement = arrangedElements.find(el => 
      el.outputs && el.outputs.some(output => output.wireName === conn.name)
    );
    
    const destElement = arrangedElements.find(el => 
      el.inputs && el.inputs.some(input => input.wireName === conn.name)
    );
    
    if (sourceElement && destElement) {
      // Add destination to source's dependencies
      dependencyGraph[sourceElement.id].push(destElement.id);
    }
  });
  
  // Step 2: Topological sort to determine layers of elements
  const visited = new Set<number>();
  const layers: number[][] = [];
  
  // First identify inputs, clocks, and sources (elements without inputs)
  const sourceLayers = arrangedElements.filter(el => 
    el.type === 'module_input' || 
    el.type === 'clk' || 
    !el.inputs || 
    el.inputs.length === 0
  ).map(el => el.id);
  
  layers.push(sourceLayers);
  sourceLayers.forEach(id => visited.add(id));
  
  // Breadth-first search to build the layers
  let currentLayer = sourceLayers;
  while (currentLayer.length > 0) {
    const nextLayer: number[] = [];
    
    // Find all elements that depend on the current layer
    currentLayer.forEach(srcId => {
      dependencyGraph[srcId].forEach(destId => {
        if (!visited.has(destId)) {
          // Check if all dependencies of this element are already visited
          const el = arrangedElements.find(e => e.id === destId);
          if (el && el.inputs) {
            const inputElements = el.inputs.map(input => {
              const source = arrangedElements.find(e => 
                e.outputs && e.outputs.some(output => output.wireName === input.wireName)
              );
              return source?.id;
            }).filter(id => id !== undefined) as number[];
            
            // If all dependencies are visited, add to the next layer
            if (inputElements.every(id => visited.has(id))) {
              nextLayer.push(destId);
              visited.add(destId);
            }
          }
        }
      });
    });
    
    if (nextLayer.length > 0) {
      layers.push(nextLayer);
    }
    
    currentLayer = nextLayer;
  }
  
  // Check for any remaining elements not in layers (possibly due to cycles)
  const remainingElements = arrangedElements
    .map(el => el.id)
    .filter(id => !visited.has(id));
  
  if (remainingElements.length > 0) {
    layers.push(remainingElements);
  }
  
  // Step 3: Assign positions to elements based on their layer
  const HORIZONTAL_SPACING = 200; // Space between layers
  const VERTICAL_SPACING = 100;   // Space between elements in the same layer
  
  layers.forEach((layerIds, layerIndex) => {
    const layerX = 100 + layerIndex * HORIZONTAL_SPACING;
    
    layerIds.forEach((id, elementIndex) => {
      const layerY = 100 + elementIndex * VERTICAL_SPACING;
      
      // Find the element and update its position
      const elementToUpdate = arrangedElements.find(el => el.id === id);
      if (elementToUpdate) {
        elementToUpdate.x = layerX;
        elementToUpdate.y = layerY;
      }
    });
  });
  
  return arrangedElements;
};

export default function SimulationCanvas({
  activeTabId,
  examples,
  playing,
  resetTriggered = false,
}: {
  activeTabId: string;
  examples: Example[];
  playing: boolean;
  resetTriggered?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<IElement[]>([]);
  const [connections, setConnections] = useState<IConnection[]>([]);
  
  // Get theme inside component body
  const theme = getTheme();
  const isDarkTheme = theme === "dark";

  // Add a state variable for tracking if simulation is running
  const [runningSimulation, setRunningSimulation] = useState<boolean>(false);

  // Synchronize runningSimulation with the playing prop
  useEffect(() => {
    setRunningSimulation(playing);
  }, [playing]);

  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 100%
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Add state variables for dragging functionality
  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [elementWasDragged, setElementWasDragged] = useState(false);
  const [elementsModified, setElementsModified] = useState(false);
  
  // Add clock frequency state (default: 20Hz)
  const [clockFrequency, setClockFrequency] = useState<number>(20);
  
  // Calculate the interval time based on formula 1/(frequency*10)
  const signalSpeed = useMemo(() => {
    // Adjust speed to be consistent regardless of wire length
    return 1 / (clockFrequency ); // Time in seconds for full wire traversal
  }, [clockFrequency]);
  
  // Add state to track active signals on wires
  const [activeSignals, setActiveSignals] = useState<Signal[]>([]);
  
  // Add a new state for storing preloaded images
  const [componentImages, setComponentImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  // Define a mapping of element types to image filenames
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
  );
  
  // Initialize the canvas history
  const { pushState, undo, redo, reset, canUndo, canRedo } = useCanvasHistory({
    elements: [],
    connections: [],
    elementPositions: new Map(),
  });

  // Preload images when component mounts
  useEffect(() => {
    const imageCache: { [key: string]: HTMLImageElement } = {};
    const themePrefix = isDarkTheme ? "d" : "w"; // 'd' for dark theme, 'w' for white/light theme
    
    // Create a list of all images to load
    const imagePromises = Object.entries(elementTypeToImageMap).map(
      ([type, imageName]) => {
        // Fix path to use assets in public directory
        const path = `${import.meta.env.BASE_URL || ""}images/components/${themePrefix}_${imageName}.png`;
        
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCache[type] = img;
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
    });
  }, [isDarkTheme, elementTypeToImageMap]); // Reload images when theme changes

  // Load data from active example
  useEffect(() => {
    const activeExample = examples.find(
      (example) =>
        example.jsonOutput &&
        activeTabId.includes(example.originalVerilogFile.name.split(".")[0])
    );

    if (activeExample && activeExample.jsonOutput) {
      // Extract elements and connections
      const rawElements = activeExample.jsonOutput.elements;
      const rawConnections = activeExample.jsonOutput.connections;
      
      // Apply automatic layout to elements based on connections
      const arrangedElements = arrangeElements(rawElements, rawConnections);
      
      // Set the arranged elements and connections
      setElements(arrangedElements);
      setConnections(rawConnections);
      
      // Reset zoom and center view
      resetZoom();
    } else {
      // If no example is selected, show warning and clear canvas
      if (activeTabId) {
        toast.warning("No active example found");
        console.warn("No active example found for:", activeTabId);
      }
      
      // Clear the canvas
      setElements([]);
      setConnections([]);
    }
  }, [activeTabId, examples]);

  // Make sure state is pushed to history after relevant operations
  useEffect(() => {
    if (elementsModified) {
      const currentState = {
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
  }, [elementsModified, elements, connections, pushState]);

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

  // Function to handle zoom from the action bar
  const handleZoomChange = (newZoomPercent: number) => {
    const newZoom = newZoomPercent / 100;
    setZoomLevel(newZoom);
  };

  // Function to reset zoom
  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Function to handle clock frequency change
  const handleClockFrequencyChange = (newFrequency: number) => {
    setClockFrequency(Math.max(1, Math.min(100, newFrequency))); // Limit between 1Hz and 100Hz
  };

  // Add state to track which input elements are active
  const [activeInputs, setActiveInputs] = useState<number[]>([]);

  // Handle mouse down event for dragging elements
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only proceed for left mouse button
    
    const { offsetX, offsetY } = event.nativeEvent;
    
    // Convert screen coordinates to canvas coordinates
    const canvasX = (offsetX - panOffset.x) / zoomLevel;
    const canvasY = (offsetY - panOffset.y) / zoomLevel;
    
    // Save the starting position of the click
    setDragStartPos({ x: canvasX, y: canvasY });
    // Reset the drag flag
    setElementWasDragged(false);
    
    // Find element under the cursor
    const clickedElement = elements.find((el) => {
      const size = 50; // Element size
      const x = el.x || 0;
      const y = el.y || 0;
      
      return (
        canvasX >= x &&
        canvasX <= x + size &&
        canvasY >= y &&
        canvasY <= y + size
      );
    });
    
    if (clickedElement) {
      // Check if the element is an input module
      if (clickedElement.type === 'module_input') {
        // Toggle the active state of the clicked input
        setActiveInputs(prev => {
          const isActive = prev.includes(clickedElement.id);
          return isActive 
            ? prev.filter(id => id !== clickedElement.id) // Remove if already active
            : [...prev, clickedElement.id]; // Add if not active
        });
        // Set elements as modified to update the history
        setElementsModified(true);
      } else {
        // For non-input elements, handle dragging
        setDraggingElement(clickedElement.id);
      }
    }
  };
  
  // Handle mouse move event for dragging elements
  const handleMouseMove = (event: React.MouseEvent) => {
    if (draggingElement === null) return;
    
    const { offsetX, offsetY } = event.nativeEvent;
    
    // Convert screen coordinates to canvas coordinates
    const canvasX = (offsetX - panOffset.x) / zoomLevel;
    const canvasY = (offsetY - panOffset.y) / zoomLevel;
    
    // Check if we've moved enough to consider this a drag
    if (
      dragStartPos &&
      (Math.abs(canvasX - dragStartPos.x) > 5 ||
       Math.abs(canvasY - dragStartPos.y) > 5)
    ) {
      setElementWasDragged(true);
    }
    
    // Update element position
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
  
  // Handle mouse up event for dragging elements
  const handleMouseUp = () => {
    // Set elements modified when dragging ends
    if (draggingElement !== null && elementWasDragged) {
      setElementsModified(true);
    }
    
    // Reset drag state
    setDraggingElement(null);
    setDragStartPos(null);
    setElementWasDragged(false);
  };

  // Modified canvas drawing function to use images and orthogonal wire paths
  const drawCanvas = useCallback(() => {
    const canvasRef = canvas.current;
    if (!canvasRef) return;
    
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    // Clear canvas with appropriate background color
    ctx.fillStyle = isDarkTheme ? "#171717" : "#ffffff";
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

    // Apply transformations (scale and translate)
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Debug info if no elements
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

    // Draw connections with orthogonal paths
    ctx.strokeStyle = isDarkTheme ? "rgb(226,226,226)" : "black";
    ctx.lineWidth = 2 / zoomLevel; // Adjust line width based on zoom

    connections.forEach(connection => {
      // Find source and destination elements for this connection
      const sourceElement = elements.find(el => 
        el.outputs && el.outputs.some(output => output.wireName === connection.name)
      );
      
      const destElement = elements.find(el => 
        el.inputs && el.inputs.some(input => input.wireName === connection.name)
      );

      if (sourceElement && destElement) {
        // Calculate connection points
        const size = 50;
        const sourceX = (sourceElement.x || 0) + size; // Start from right side of source
        const sourceY = (sourceElement.y || 0) + size/2; // Middle of element
        const destX = (destElement.x || 0); // End at left side of destination
        const destY = (destElement.y || 0) + size/2; // Middle of element
        
        // Calculate orthogonal path with corners
        const path = calculateOrthogonalPath(sourceX, sourceY, destX, destY);
        
        // Draw the path
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        
        // Draw all path segments
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        
        ctx.stroke();
      }
    });

    // Draw elements
    elements.forEach(el => {
      const x = el.x || 0;
      const y = el.y || 0;
      const size = 50;

      // Determine which image to use, checking if input is active
      let elementType = el.type;
      if (el.type === 'module_input' && activeInputs.includes(el.id)) {
        elementType = 'module_input_en'; // Use enabled input image
      }

      // Get the image for this element type
      const image = componentImages[elementType];

      // If image is loaded, draw it
      if (image) {
        ctx.drawImage(image, x, y, size, size);
      } else {
        // Fallback to colored rectangle if image is not loaded
        let color;
        switch(el.type) {
          case 'clk':
            color = 'blue';
            break;
          case 'module_input':
          case 'module_input_en':
            color = 'green';
            break;
          case 'module_output':
          case 'module_output_en':
            color = 'red';
            break;
          case 'DFF':
          case 'DFF_NE':
            color = 'purple';
            break;
          default:
            color = 'gray';
        }

        // Draw element as rectangle with label
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        
        // Draw border
        ctx.strokeStyle = isDarkTheme ? "white" : "black";
        ctx.lineWidth = 1 / zoomLevel;
        ctx.strokeRect(x, y, size, size);
      }
      
      // Always draw element name below the image for clarity
      ctx.fillStyle = isDarkTheme ? "white" : "black";
      ctx.font = `${12 / zoomLevel}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(el.name, x + size/2, y + size + 5);
    });

    // Draw signals as small black circles
    if (runningSimulation) {
      ctx.fillStyle = isDarkTheme ? "#ffffff" : "#000000";
      
      activeSignals.forEach(signal => {
        if (signal.position < 1.0 && signal.points.length >= 2) {
          // Calculate the total length of the path (should already be in signal.totalLength)
          const totalLength = signal.totalLength;
          
          // Calculate distance to travel based on progress
          const targetDistance = totalLength * signal.position;
          
          // Find the points between which the signal currently is
          let currentDistance = 0;
          let segmentIndex = 0;
          
          for (let i = 0; i < signal.points.length - 1; i++) {
            const dx = signal.points[i+1].x - signal.points[i].x;
            const dy = signal.points[i+1].y - signal.points[i].y;
            const segmentLength = Math.sqrt(dx*dx + dy*dy);
            
            if (currentDistance + segmentLength >= targetDistance) {
              segmentIndex = i;
              break;
            }
            
            currentDistance += segmentLength;
          }
          
          // Calculate position within the current segment
          const p1 = signal.points[segmentIndex];
          const p2 = signal.points[segmentIndex + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const segmentLength = Math.sqrt(dx*dx + dy*dy);
          const segmentProgress = (targetDistance - currentDistance) / segmentLength;
          
          // Calculate the exact position of the signal
          const signalX = p1.x + dx * segmentProgress;
          const signalY = p1.y + dy * segmentProgress;
          
          // Draw the signal
          ctx.beginPath();
          ctx.arc(signalX, signalY, 4 / zoomLevel, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    ctx.restore();
  }, [elements, connections, panOffset, zoomLevel, isDarkTheme, componentImages, runningSimulation, activeSignals, activeInputs]);

  // Handle canvas resize
  useEffect(() => {
    function handleResize() {
      if (containerRef.current && canvas.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.current.width = width;
        canvas.current.height = height;
        setCanvasSize({ width, height });
      }
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Draw canvas whenever necessary
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, canvasSize, elements]);

  // Add effect to handle simulation running
  useEffect(() => {
    if (!runningSimulation) {
      // Clear all signals when simulation stops
      setActiveSignals([]);
      return;
    }

    // Find the clock element
    const clockElement = elements.find(el => el.type === 'clk');
    if (!clockElement) return;

    // Find all connections that originate from the clock
    const clockConnections = connections.filter(conn => {
      const sourceElement = elements.find(el => 
        el.outputs && el.outputs.some(output => output.wireName === conn.name)
      );
      return sourceElement?.id === clockElement.id;
    });

    // Create a timer to emit signals from the clock
    const clockInterval = setInterval(() => {
      setActiveSignals(prevSignals => {
        // Check for existing signals on each connection
        const updatedSignals = [...prevSignals];
        
        // Emit signals from active inputs as well
        const inputConnections = connections.filter(conn => {
          const sourceElement = elements.find(el => 
            el.outputs && el.outputs.some(output => output.wireName === conn.name)
          );
          return sourceElement && 
                 sourceElement.type === 'module_input' && 
                 activeInputs.includes(sourceElement.id);
        });
        
        // Combine clock connections and input connections for signal generation
        const allSignalSources = [...clockConnections, ...inputConnections];
        
        allSignalSources.forEach(conn => {
          // Check if there's already a signal on this connection
          const signalExists = updatedSignals.some(signal => signal.connectionName === conn.name);
          if (signalExists) return; // Don't emit if a signal is already present

          // Find the source and destination elements
          const source = elements.find(el => 
            el.outputs && el.outputs.some(output => output.wireName === conn.name)
          );
          const dest = elements.find(el => 
            el.inputs && el.inputs.some(input => input.wireName === conn.name)
          );

          if (source && dest) {
            const size = 50;
            const sourceX = (source.x || 0) + size; // Start from right side of source
            const sourceY = (source.y || 0) + size/2; // Middle of element
            const destX = (dest.x || 0); // End at left side of destination
            const destY = (dest.y || 0) + size/2; // Middle of element
            
            // Calculate path for the signal
            const points = calculateOrthogonalPath(sourceX, sourceY, destX, destY);
            
            // Calculate total path length
            let totalLength = 0;
            for (let i = 0; i < points.length - 1; i++) {
              const dx = points[i+1].x - points[i].x;
              const dy = points[i+1].y - points[i].y;
              totalLength += Math.sqrt(dx*dx + dy*dy);
            }
            
            // Create timestamp when signal is created
            const createdAt = performance.now();
            
            // Create a new signal at the start of the wire
            updatedSignals.push({
              connectionName: conn.name,
              position: 0, // Start at position 0 (0%)
              points,
              totalLength,
              createdAt,
              sourceName: source.name,
              destName: dest.name
            });
          }
        });

        return updatedSignals;
      });
    }, 1000 / clockFrequency); // Emit signals at the clock frequency

    // Create a timer to move signals along wires
    const signalInterval = setInterval(() => {
      setActiveSignals(prev => {
        // Move each signal along its wire
        const updatedSignals = prev.map(signal => {
          // Calculate new position
          const newPosition = signal.position + (0.01 / signalSpeed);
          
          return {
            ...signal,
            // Increment position by a percentage that ensures consistent travel time
            position: newPosition
          };
        });
        
        // Remove signals that reached the end (position >= 1.0 meaning 100%)
        return updatedSignals.filter(signal => signal.position < 1.0);
      });
    }, 10); // Update frequently for smooth animation
    
    return () => {
      clearInterval(clockInterval);
      clearInterval(signalInterval);
    };
  }, [runningSimulation, elements, connections, clockFrequency, signalSpeed, activeInputs]);

  // Reset active inputs when the reset action is triggered
  useEffect(() => {
    if (resetTriggered) {
      setActiveInputs([]);
    }
  }, [resetTriggered]);

  // Add a button to the action bar for auto-arranging elements
  const handleAutoArrange = useCallback(() => {
    // Arrange elements and update them
    const arrangedElements = arrangeElements(elements, connections);
    setElements(arrangedElements);
    setElementsModified(true);
  }, [elements, connections]);

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
        onMouseLeave={handleMouseUp}
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
            clockFrequency={clockFrequency}
            onClockFrequencyChange={handleClockFrequencyChange}
            onAutoArrange={handleAutoArrange}
          />
        </div>
      </div>
    </div>
  );
}