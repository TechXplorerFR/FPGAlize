import { useState } from "react";
import TabDisplayer from "./components/app/TabDisplayer";
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
      <TabDisplayer activeTab={activeTab} />
      
    </>
  );
}

export default App;
