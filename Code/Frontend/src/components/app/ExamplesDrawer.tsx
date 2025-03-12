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
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

function ExamplesDrawer() {
  return (
    <>
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <button className="fixed left-0 top-1/2 h-[10vh] transform -translate-y-1/2 bg-gray-100 p-2 rounded-r-lg border-y border-r border-solid border-gray-300 shadow-md hover:bg-gray-200">
            <ChevronRight size={20} />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="relative">
            <DrawerHeader>
              <DrawerTitle>Loaded Examples</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
            <DrawerClose asChild>
              <div className="absolute top-[50vh] right-[-37px] h-[10vh] transform -translate-y-1/2 bg-gray-100 p-2 rounded-r-lg border-y border-r border-solid border-gray-300 shadow-md hover:bg-gray-200 flex justify-center items-center">
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
