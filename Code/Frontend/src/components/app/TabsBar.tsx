import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tab } from "@/lib/types";

export default function TabsBar({ 
  setActiveTabId, 
  tabs,
  activeTabId,
  setTabs 
}: { 
  setActiveTabId: (id: string) => void, 
  tabs: Tab[],
  activeTabId: string,
  setTabs: (tabs: Tab[]) => void
}) {
  // Update selected tab when tabs change
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some(tab => tab.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId, setActiveTabId]);

  // When a tab is clicked, update both local state and parent component
  const handleTabClick = (id: string) => {
    setActiveTabId(id);
  };

  const removeTab = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent tab selection when removing
    const newTabs = tabs.filter((tab) => tab.id !== id);
    
    // Update parent component's tabs state
    setTabs(newTabs);
    
    // Always select the first tab if there are tabs remaining
    // This ensures the code fetching useEffect is triggered in other components
    if (newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    } else {
      // If no tabs left, reset the selected tab and active tab ID
      setActiveTabId("");
    }
  };

  return (
    <div className="flex border-b overflow-hidden shadow-md h-[5vh]">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "flex items-center px-4 py-2 border-r cursor-pointer",
            activeTabId === tab.id ? "bg-gray-100 dark:bg-neutral-700" : ""
          )}
          onClick={() => handleTabClick(tab.id)}
        >
          <span className="mr-2">{tab.name}</span>
          <X
            className="w-4 h-4 cursor-pointer"
            onClick={(e) => removeTab(tab.id, e)}
          />
        </div>
      ))}
    </div>
  );
}
