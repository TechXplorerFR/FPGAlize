import { useState } from "react";
import CodeEditor from "./CodeEditor";
import SimulationCanvas from "./SimulationCanvas";
import type { Example, Tab } from "@/lib/types/types";
import { Skeleton } from "@/components/ui/skeleton";

interface TabDisplayerProps {
  activeView: string;
  activeTabId: string;
  examples: Example[];
  tabs: Tab[];
  isLoading: boolean;
  playing: boolean;
  resetTriggered?: boolean;
}

export default function TabDisplayer({
  activeView,
  activeTabId,
  examples,
  tabs,
  isLoading,
  playing,
  resetTriggered = false
}: TabDisplayerProps) {
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

  if (isLoading) {
    return <div className="w-full h-[88vh] flex items-center justify-center">
      <Skeleton className="w-3/4 h-3/4 rounded-md" />
    </div>;
  }

  return (
    <>
      {/* Conditional rendering */}
      {activeView === "Code" && <CodeEditor activeTabId={activeTabId} examples={examples} tabs={tabs} />}
      {activeView === "Simulation" && (
        <SimulationCanvas 
          activeTabId={activeTabId} 
          examples={examples} 
          playing={playing}
          resetTriggered={resetTriggered}
        />
      )}
      {activeView === "Mix" && (
        <div style={{ display: "flex", width: "100%", height: "88vh" }}>
          <div style={{ width: `${editorWidth}%`, overflow: "hidden" }}>
            <CodeEditor activeTabId={activeTabId} examples={examples} tabs={tabs} />
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

          <div
            style={{
              width: `${100 - editorWidth}%`,
              height: "88vh",
              overflow: "hidden",
            }}
          >
            <SimulationCanvas 
              activeTabId={activeTabId} 
              examples={examples} 
              playing={playing} 
              resetTriggered={resetTriggered}
            />
          </div>
        </div>
      )}
    </>
  );
}
