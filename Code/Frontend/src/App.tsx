import CodeEditor from "./components/app/CodeEditor";
import ExamplesDrawer from "./components/app/ExamplesDrawer";
import Navbar from "./components/app/Navbar";
import TabsBar from "./components/app/TabsBar";

function App() {
  return (
    <>
      <ExamplesDrawer />
      <Navbar />
      <TabsBar />
      <CodeEditor />
    </>
  );
}

export default App;
