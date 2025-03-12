import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";

export default function Navbar() {
  const [activeTab, setActiveTab] = useState("Code");
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex items-center justify-between p-2 border-b w-full">
      {/* Tab Selector */}
      <ToggleGroup
        type="single"
        value={activeTab}
        onValueChange={(value) => value && setActiveTab(value)}
        className="rounded-lg p-1 ml-[30vw]"
      >
        <ToggleGroupItem value="Code" className="px-8 border">
          Code
        </ToggleGroupItem>
        <ToggleGroupItem value="Mix" className="px-8 border">
          Mix
        </ToggleGroupItem>
        <ToggleGroupItem value="Simulation" className="px-8 border">
          Simulation
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Playback Controls */}
      <div className="flex space-x-2 border rounded-lg p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 text-green-500" />
          )}
        </Button>
        <Button variant="ghost" size="icon">
          <Square className="w-5 h-5" />
        </Button>
      </div>

      {/* Export Button */}
      <Button className="px-4 py-2 rounded-md">Export</Button>
    </div>
  );
}
