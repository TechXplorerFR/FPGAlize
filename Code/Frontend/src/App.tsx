import { useState, useEffect } from "react";
import TabDisplayer from "./components/app/TabDisplayer";
import ExamplesDrawer from "./components/app/ExamplesDrawer";
import Navbar from "./components/app/Navbar";
import TabsBar from "./components/app/TabsBar";
import { countFileLines, readFileContent } from "@/lib/utils";
import type { Example, Tab } from "@/lib/types";

function App() {
  const [activeView, setActiveView] = useState<string>("Code");
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabs, setTabs] = useState<Tab[]>([]);

  // Initialize with empty files
  const emptyFile = new File([""], "empty.v", { type: "text/plain" });
  const initialElementList: Example[] = Array(3).fill({
    originalVerilogFile: emptyFile,
    postSynthesisVerilogFile: emptyFile,
    postSynthesisSdfFile: emptyFile,
    jsonOutput: null,
    originalVerilogFileInformation: {
      name: "Example 1",
      lineCount: 0,
      fileSize: 0,
    },
  });

  const [examples, setExamples] = useState<Example[]>(initialElementList);

  async function loadExampleFiles() {
    try {
      const originalVerilogFile1 = await readFileContent(
        "/src/data/samples/1ff_no_rst_VTR/1ff_no_rst_VTR.v"
      );
      const postSynthesisverilogFile1 = await readFileContent(
        "/src/data/samples/1ff_no_rst_VTR/PS_1ff_no_rst_VTR.v"
      );
      const postSynthesisSdfFile1 = await readFileContent(
        "/src/data/samples/1ff_no_rst_VTR/PS_1ff_no_rst_VTR.sdf"
      );

      // Calculate line count first
      const lineCount = await countFileLines(originalVerilogFile1);

      // Update the state with the loaded files
      setExamples((prevList) => {
        const newList = [...prevList];
        newList[0] = {
          originalVerilogFile: originalVerilogFile1,
          postSynthesisVerilogFile: postSynthesisverilogFile1,
          postSynthesisSdfFile: postSynthesisSdfFile1,
          jsonOutput: null,
          originalVerilogFileInformation: {
            name: "1ff_no_rst_VTR",
            lineCount: lineCount,
            fileSize: originalVerilogFile1.size,
          },
        };
        return newList;
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load example files:", error);
      setIsLoading(false);
    }
  }

  // Load example files when the component mounts
  useEffect(() => {
    loadExampleFiles();
  }, []);

  return (
    <>
      <ExamplesDrawer
        examples={examples}
        isLoading={isLoading}
        setTabs={setTabs}
        setActiveTabId={setActiveTabId}
      />
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      <TabsBar setActiveTabId={setActiveTabId} tabs={tabs} setTabs={setTabs} />
      <TabDisplayer
        activeView={activeView}
        activeTabId={activeTabId}
        examples={examples}
        tabs={tabs}
        isLoading={isLoading}
      />
    </>
  );
}

export default App;
