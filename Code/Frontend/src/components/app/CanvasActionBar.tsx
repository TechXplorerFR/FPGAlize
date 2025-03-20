import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Undo2, Redo2, RotateCcw } from "lucide-react";

interface CanvasActionBarProps {
  zoom: number;
  onZoomChange: (delta: number) => void;
  onResetZoom: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const CanvasActionBar = ({
  zoom,
  onZoomChange,
  onResetZoom,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
}: CanvasActionBarProps) => {
  return (
    <div className="flex gap-2 max-h-[4.5vh]">
      <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onZoomChange(-10)}
          className="cursor-pointer"
        >
          -
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="px-2 cursor-pointer" onClick={onResetZoom}>
                {zoom}%
              </span>
            </TooltipTrigger>
            <TooltipContent>Reset zoom to 100%</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onZoomChange(10)}
          className="cursor-pointer"
        >
          +
        </Button>
      </div>
      <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="cursor-pointer"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className={`w-5 h-5`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo last action</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="cursor-pointer"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo2 className={`w-5 h-5`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo last action</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer"
                onClick={onReset || onResetZoom}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restore to default</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CanvasActionBar;
