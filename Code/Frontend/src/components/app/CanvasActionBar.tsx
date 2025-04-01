import { Button } from "@/components/ui/button";
import { Undo2, Redo2, ZoomIn, ZoomOut, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { GitBranchPlus } from "lucide-react";

interface CanvasActionBarProps {
  zoom: number;
  onZoomChange: (delta: number) => void;
  onResetZoom: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  clockFrequency: number;
  onClockFrequencyChange: (frequency: number) => void;
  onAutoArrange?: () => void; // Add the new prop type
}

const CanvasActionBar = ({
  zoom,
  onZoomChange,
  onResetZoom,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  clockFrequency,
  onClockFrequencyChange,
  onAutoArrange, // Add the new prop for auto arrangement
}: CanvasActionBarProps) => {
  const [isEditingFrequency, setIsEditingFrequency] = useState(false);
  const [frequencyInput, setFrequencyInput] = useState(
    clockFrequency.toString()
  );

  const handleFrequencyInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFrequencyInput(e.target.value);
  };

  const handleFrequencyInputBlur = () => {
    const newFrequency = parseFloat(frequencyInput);
    if (!isNaN(newFrequency) && newFrequency > 0) {
      onClockFrequencyChange(newFrequency);
    } else {
      setFrequencyInput(clockFrequency.toString());
    }
    setIsEditingFrequency(false);
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 left-4 bg-white dark:bg-neutral-800 rounded-md shadow-md p-2 flex items-center gap-4">
        {/* Zoom controls with tooltips */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onZoomChange(-10)}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom out</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="text-xs w-16"
                onClick={onResetZoom}
              >
                {zoom}%
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset zoom</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onZoomChange(10)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom in</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-neutral-700" />

        {/* Canvas history controls with tooltips */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
          
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onReset}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset canvas</p>
            </TooltipContent>
          </Tooltip> */}
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-neutral-700" />

        {/* Auto-arrange button */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                aria-label="Auto Arrange"
                onClick={onAutoArrange}
              >
                <GitBranchPlus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto Arrange Components</TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-neutral-700" />

        {/* Clock frequency controls - already has tooltips */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {isEditingFrequency ? (
                  <Input
                    className="w-12 h-6 text-xs p-1"
                    value={frequencyInput}
                    onChange={handleFrequencyInputChange}
                    onBlur={handleFrequencyInputBlur}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleFrequencyInputBlur()
                    }
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-xs cursor-pointer"
                    onClick={() => setIsEditingFrequency(true)}
                  >
                    {clockFrequency} Hz
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clock frequency</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-24">
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[clockFrequency]}
                  onValueChange={([value]) => onClockFrequencyChange(value)}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust clock frequency (0.1-10 Hz)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CanvasActionBar;
