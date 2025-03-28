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
import { Separator } from "@/components/ui/separator";
import AddExampleModal from "@/components/app/AddExampleModal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Example as ExampleType, Tab } from "@/lib/types/types";
import { useState } from "react";
import { toast } from "sonner";

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

  const handleExampleClick = (index: number) => {
    const example = examples[index];
    
    if (!example || !example.originalVerilogFileInformation) {
      toast.error("Failed to load example: Invalid example data");
      return;
    }
    
    // Get the existing tabs
    setTabs((prevTabs) => {
      // Check if tab already exists
      const existingTabIndex = prevTabs.findIndex(
        (tab) => tab.name === example.originalVerilogFileInformation.name
      );
      
      if (existingTabIndex !== -1) {
        // Tab exists, just activate it
        if (setActiveTabId) {
          setActiveTabId(prevTabs[existingTabIndex].id);
        }
        return prevTabs;
      } else {
        try {
          // Create a new tab with a unique ID
          const newTab: Tab = {
            id: example.originalVerilogFileInformation.name,
            name: example.originalVerilogFileInformation.name,
            example: example,
          };
          
          // Add the new tab and set it as active
          if (setActiveTabId) {
            setActiveTabId(example.originalVerilogFileInformation.name);
          }
          toast.success(`Loaded ${newTab.name}`);
          return [...prevTabs, newTab];
        } catch (error) {
          toast.error(`Failed to create tab: ${error instanceof Error ? error.message : String(error)}`);
          return prevTabs;
        }
      }
    });
    
    // Close the drawer after selection
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
