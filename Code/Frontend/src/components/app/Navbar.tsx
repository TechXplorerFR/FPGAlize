import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Example } from "@/lib/types/types";
import { toastMessage } from "@/lib/services/toast";
import { ModeToggle } from "@/components/app/ModeToggle";

interface NavbarProps {
  activeView: string;
  setActiveView: (value: string) => void; // Define the prop type for state setter
  activeTabId: string;
  examples: Example[];
  playing: boolean;
  setPlaying: (value: boolean) => void;
  onResetSimulation: () => void;
}

export default function Navbar({
  activeView,
  setActiveView,
  activeTabId,
  examples,
  playing,
  setPlaying,
}: NavbarProps) {
  const handleExport = () => {
    if (!activeTabId || activeTabId === "") {
      toastMessage.warning(
        "No active tab selected. Please select a file first."
      );
      return;
    }
    const currentExample = examples.find(
      (example) => example.originalVerilogFileInformation.name === activeTabId
    );

    // Export the PostSythesis .v and .sdf file in a zip
    const zip = new JSZip();
    if (currentExample?.originalVerilogFile) {
      zip.file(
        `original-${currentExample.originalVerilogFileInformation.name}.v`,
        currentExample.originalVerilogFile
      );
    }
    if (currentExample?.postSynthesisVerilogFile) {
      zip.file(
        `${currentExample.originalVerilogFileInformation.name}.v`,
        currentExample.postSynthesisVerilogFile
      );
    }
    if (currentExample?.postSynthesisSdfFile) {
      zip.file(
        `${currentExample.originalVerilogFileInformation.name}.sdf`,
        currentExample.postSynthesisSdfFile
      );
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(
        content,
        `${currentExample?.originalVerilogFileInformation.name}.zip`
      );
    });
  };

  return (
    <div className="flex items-center justify-between p-2 border-b w-full h-[7vh]">
      {/* Mode Toggle */}
      <ModeToggle />
      {/* Tab Selector */}
      <ToggleGroup
        type="single"
        value={activeView}
        onValueChange={(value) => value && setActiveView(value)}
        className="rounded-lg p-1 ml-[15vw]"
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
      </div>

      {/* Export Button */}
      <Button onClick={handleExport} className="px-4 py-2 rounded-md">
        Export
      </Button>
    </div>
  );
}
