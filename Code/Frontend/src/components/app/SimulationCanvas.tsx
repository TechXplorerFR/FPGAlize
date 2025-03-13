import { useRef, useState, useEffect } from "react";
import { Element, elementList } from "./Element";

export default function SimulationCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<Element[]>(() => {
    const saved = sessionStorage.getItem("elements");
    return saved ? JSON.parse(saved) : elementList;
  });

  const [draggingElement, setDraggingElement] = useState<number | null>(null);

  useEffect(() => {
    sessionStorage.setItem("elements", JSON.stringify(elements));

    const canvasRef = canvas.current;
    if (!canvasRef) return;
    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    
    elements.forEach((el) => {
        ctx.fillStyle = "red";
        ctx.fillRect(el.x, el.y, 50, 50);
    });
  }, [elements]);

  const handleMouseDown = (event: React.MouseEvent) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const element = elements.find(
      (el) => offsetX >= el.x && offsetX <= el.x + 50 && offsetY >= el.y && offsetY <= el.y + 50
    );

    if (element) {
      setDraggingElement(element.id);
      setElements((prev) =>
        prev.map((el) =>
          el.id === element.id ? { ...el, isDragging: true } : el
        )
      );
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (draggingElement === null) return;
    const { offsetX, offsetY } = event.nativeEvent;

    setElements((prev) =>
      prev.map((el) =>
        el.id === draggingElement ? { ...el, x: offsetX - 25, y: offsetY - 25 } : el
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
    setElements((prev) =>
      prev.map((el) => ({ ...el, isDragging: false }))
    );
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-100">
      <canvas
        ref={canvas}
        width={1920}
        height={900}
        className="border border-gray-400 bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}
