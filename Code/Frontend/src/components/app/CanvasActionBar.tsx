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
}

const CanvasActionBar = ({
  zoom,
  onZoomChange,
  onResetZoom,
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
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Undo2 className="w-5 h-5 text-gray-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo last action</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Redo2 className="w-5 h-5 text-gray-400" />
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
                onClick={onResetZoom}
              >
                <RotateCcw className="w-5 h-5 text-gray-400" />
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
