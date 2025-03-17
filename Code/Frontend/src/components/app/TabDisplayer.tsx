import { useState } from "react";
import CodeEditor from "./CodeEditor";
import SimulationCanvas from "./SimulationCanvas";

export default function TabDisplayer({ activeTab }: { activeTab: string }) {
  const [editorWidth, setEditorWidth] = useState<number>(50);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = editorWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      const newWidth = Math.max(20, Math.min(80, startWidth + delta));
      setEditorWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      {/* Conditional rendering */}
      {activeTab === "Code" && <CodeEditor />}
      {activeTab === "Simulation" && <SimulationCanvas />}
      {activeTab === "Mix" && (
        <div style={{ display: "flex", width: "100%", height: "88vh" }}>
          <div style={{ width: `${editorWidth}%`, overflow: "hidden" }}>
            <CodeEditor />
          </div>
          {/* Draggable Divider */}
          <div
            style={{
              width: "6px",
              cursor: "ew-resize",
              backgroundColor: "#ccc",
              height: "88vh",
            }}
            onMouseDown={handleMouseDown}
          />

          <div style={{ width: `${100 - editorWidth}%`, height: "88vh", overflow: "hidden" }}>
            <SimulationCanvas />
          </div>
        </div>
      )}
    </>
  );
}
