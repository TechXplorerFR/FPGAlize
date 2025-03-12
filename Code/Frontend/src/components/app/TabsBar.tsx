import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tabs } from "@/data/sample-tabs";

export default function TabsBar() {
  const [activeTabs, setActiveTabs] = useState(tabs);

  const removeTab = (id: string) => {
    setActiveTabs(activeTabs.filter((tab) => tab.id !== id));
  };

  return (
    <div className="flex border-b overflow-hidden shadow-md">
      {activeTabs.map((tab) => (
        <div
          key={tab.id}
          className={cn("flex items-center px-4 py-2 border-r")}
        >
          <span className="mr-2">{tab.name}</span>
          <X
            className="w-4 h-4 cursor-pointer"
            onClick={() => removeTab(tab.id)}
          />
        </div>
      ))}
    </div>
  );
}
