import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tab } from "@/lib/types";

export default function TabsBar({ 
  setActiveTabId, 
  tabs, 
  setTabs 
}: { 
  setActiveTabId: (id: string) => void, 
  tabs: Tab[],
  setTabs: (tabs: Tab[]) => void
}) {
  // Keep a local state for selected tab only, use the tabs from props
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]?.id || "");

  // Update selected tab when tabs change
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some(tab => tab.id === selectedTab)) {
      setSelectedTab(tabs[0].id);
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, selectedTab, setActiveTabId]);

  // When a tab is clicked, update both local state and parent component
  const handleTabClick = (id: string) => {
    setSelectedTab(id);
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
      setSelectedTab(newTabs[0].id);
      setActiveTabId(newTabs[0].id);
    } else {
      // If no tabs left, reset the selected tab and active tab ID
      setSelectedTab("");
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
            selectedTab === tab.id ? "bg-gray-100 dark:bg-neutral-700" : ""
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
