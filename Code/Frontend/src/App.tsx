import { useState } from "react";
import TabDisplayer from "./components/app/TabDisplayer";
import ExamplesDrawer from "./components/app/ExamplesDrawer";
import Navbar from "./components/app/Navbar";
import TabsBar from "./components/app/TabsBar";
import { tabs } from "./data/sample-tabs";

function App() {
  const [activeView, setActiveView] = useState<string>("Code");
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || "");
  
  return (
    <>
      <ExamplesDrawer />
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      <TabsBar setActiveTabId={setActiveTabId} />
      <TabDisplayer activeView={activeView} activeTabId={activeTabId} />
    </>
  );
}

export default App;
