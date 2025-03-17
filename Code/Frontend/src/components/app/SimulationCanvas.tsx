import { useRef, useState, useEffect, useCallback } from "react";
import { Element, elementList } from "./Element";

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

export default function SimulationCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<Element[]>(() => {
    const saved = sessionStorage.getItem("elements");
    return saved ? JSON.parse(saved) : elementList;
  });

  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Memoize drawCanvas to prevent recreation on each render
  const drawCanvas = useCallback(() => {
    const canvasRef = canvas.current;
    if (!canvasRef) return;
    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Draw wires with only horizontal and vertical paths
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    elements.forEach((el) => {
      el.connectedTo.forEach((connectedId) => {
        const connectedEl = elements.find((e) => e.id === connectedId);
        if (connectedEl) {
          const startX = el.x + panOffset.x + 25;
          const startY = el.y + panOffset.y + 25;
          const endX = connectedEl.x + panOffset.x + 25;
          const endY = connectedEl.y + panOffset.y + 25;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          if (startX !== endX) ctx.lineTo(endX, startY);
          if (startY !== endY) ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      });
    });

    // Draw elements
    elements.forEach((el) => {
      ctx.fillStyle = "red";
      ctx.fillRect(el.x + panOffset.x, el.y + panOffset.y, 50, 50);

      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        el.id.toString(),
        el.x + panOffset.x + 25,
        el.y + panOffset.y + 25
      );
    });
  }, [elements, panOffset]);

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
    }, 100); // 100ms debounce time

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

  const handleMouseDown = (event: React.MouseEvent) => {
    const { offsetX, offsetY, button } = event.nativeEvent;

    if (button === 1 || button === 2) {
      // Middle or right-click to start panning
      setIsPanning(true);
      setStartPan({ x: offsetX, y: offsetY });
      return;
    }

    const element = elements.find(
      (el) =>
        offsetX - panOffset.x >= el.x &&
        offsetX - panOffset.x <= el.x + 50 &&
        offsetY - panOffset.y >= el.y &&
        offsetY - panOffset.y <= el.y + 50
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

    setElements((prev) =>
      prev.map((el) =>
        el.id === draggingElement
          ? {
              ...el,
              x: offsetX - panOffset.x - 10,
              y: offsetY - panOffset.y - 10,
            }
          : el
      )
    );
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (event.button === 1 || event.button === 2) {
      setIsPanning(false);
    }
    setDraggingElement(null);
  };

  // Add wheel event handler for scroll-based panning
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault(); // Prevent default scrolling behavior
    
    // Update pan offset based on wheel delta values
    setPanOffset((prev) => ({
      x: prev.x - event.deltaX,
      y: prev.y - event.deltaY,
    }));
  };

  return (
    <div ref={containerRef} className="w-full h-[88vh] bg-gray-100">
      <canvas
        ref={canvas}
        className="border border-gray-400 bg-white w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
