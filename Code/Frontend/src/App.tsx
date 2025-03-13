import { useState } from "react";
import CodeEditor from "./components/app/CodeEditor";
import SimulationCanvas from "./components/app/SimulationCanvas";
import ExamplesDrawer from "./components/app/ExamplesDrawer";
import Navbar from "./components/app/Navbar";
import TabsBar from "./components/app/TabsBar";

function App() {
  const [activeTab, setActiveTab] = useState<string>("Code");

  return (
    <>
      <ExamplesDrawer />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabsBar />
      
      {/* Conditional rendering */}
      {activeTab === "Code" && <CodeEditor />}
      {activeTab === "Simulation" && <SimulationCanvas />}
    </>
  );
}


export default App;
