import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Example from "@/components/app/Example";
import { exampleFiles } from "@/data/sample-files";
import { Separator } from "@/components/ui/separator";

function ExamplesDrawer() {
  return (
    <>
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <button className="fixed left-0 top-1/2 h-[10vh] transform -translate-y-1/2 bg-gray-100 p-2 rounded-r-lg border-y border-r border-solid border-gray-300 shadow-md hover:bg-gray-200 dark:bg-neutral-900 dark:border-neutral-800 z-10">
            <ChevronRight size={20} />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="relative">
            <DrawerHeader>
              <DrawerTitle>Loaded Examples</DrawerTitle>
              <DrawerDescription>
                Click on the follwing examples to see them
              </DrawerDescription>
            </DrawerHeader>
            <Separator />
            {exampleFiles.map((_example, index) => (
              <Example
                name={exampleFiles[index].name}
                lineCount={exampleFiles[index].lineCount}
                fileSize={exampleFiles[index].fileSize}
                isHighlighted={index == 1}
                index={index}
              />
            ))}
            <Separator />
            <DrawerClose asChild>
              <div className="absolute top-[50vh] right-[-37px] h-[10vh] transform -translate-y-1/2 bg-gray-100 p-2 rounded-r-lg border-y border-r border-solid border-gray-300 shadow-md hover:bg-gray-200 flex justify-center items-center dark:bg-neutral-900 dark:border-neutral-800">
                <button>
                  <ChevronLeft size={20} />
                </button>
              </div>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default ExamplesDrawer;
