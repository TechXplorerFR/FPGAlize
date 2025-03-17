import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Example from "@/components/app/Example";
import { exampleFiles } from "@/data/sample-files";
import { Separator } from "@/components/ui/separator";
import AddExampleModal from "@/components/app/AddExampleModal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Example as ExampleType, Tab } from "@/lib/types";
import { useState } from "react";

interface ExamplesDrawerProps {
  examples: ExampleType[];
  isLoading: boolean;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  setActiveTabId?: (id: string) => void;
}

function ExamplesDrawer({
  examples,
  isLoading,
  setTabs,
  setActiveTabId,
}: ExamplesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handler to close drawer after handling example click
  const handleExampleClick = (index: number) => {
    if (examples.length > 0 && examples[index]) {
      // Pass the tab data as before
      if (setTabs)
        setTabs((prev) => [
          ...prev,
          {
            id: examples[index].originalVerilogFileInformation.name,
            name: examples[index].originalVerilogFileInformation.name,
            content: examples[index].originalVerilogFile || "",
            language: "verilog",
          },
        ]);

      // Set the active tab if provided
      if (setActiveTabId)
        setActiveTabId(examples[index].originalVerilogFileInformation.name);
    } else {
      // Handle sample files as before
      if (setTabs)
        setTabs((prev) => [
          ...prev,
          {
            id: exampleFiles[index].name,
            name: exampleFiles[index].name,
            content: exampleFiles[index] || "",
            language: "verilog",
          },
        ]);

      // Set the active tab if provided
      if (setActiveTabId) setActiveTabId(exampleFiles[index].name);
    }

    // Close the drawer
    setIsOpen(false);
  };

  return (
    <>
      <Drawer direction="left" open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <button className="fixed left-0 top-1/2 h-[10vh] transform -translate-y-1/2 bg-gray-100 p-2 rounded-r-lg border-y border-r border-solid border-gray-300 shadow-md hover:bg-gray-200 dark:bg-neutral-900 dark:border-neutral-800 z-10">
            <ChevronRight size={20} />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="relative flex flex-col h-full">
            <div className="flex-grow">
              <DrawerHeader>
                <DrawerTitle>Loaded Examples</DrawerTitle>
                <DrawerDescription>
                  Click on the following examples to see them
                </DrawerDescription>
              </DrawerHeader>
              <Separator />

              {isLoading
                ? // Show skeletons while loading
                  Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="p-4">
                        <Skeleton className="h-12 w-full mb-2" />
                      </div>
                    ))
                : // Show real examples when loaded
                  examples.map(
                    (example, index) =>
                      example.originalVerilogFileInformation.lineCount > 0 && (
                        <Example
                          key={index}
                          name={example.originalVerilogFileInformation.name}
                          lineCount={
                            example.originalVerilogFileInformation.lineCount
                          }
                          fileSize={
                            example.originalVerilogFileInformation.fileSize
                          }
                          onClick={() => handleExampleClick(index)}
                        />
                      )
                  )}

              {/* Fallback to sample files if no examples are loaded */}
              {!isLoading &&
                !examples.some(
                  (e) => e.originalVerilogFileInformation.lineCount > 0
                ) &&
                exampleFiles.map((sampleFile, index) => (
                  <Example
                    key={index}
                    name={sampleFile.name}
                    lineCount={sampleFile.lineCount}
                    fileSize={sampleFile.fileSize}
                    onClick={() => handleExampleClick(index)}
                  />
                ))}

              <Separator />
            </div>
            <DrawerFooter className="p-4">
              <AddExampleModal />
            </DrawerFooter>
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
