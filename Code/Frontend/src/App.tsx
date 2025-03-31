import { useState, useEffect } from "react";
import TabDisplayer from "./components/app/TabDisplayer";
import ExamplesDrawer from "./components/app/ExamplesDrawer";
import Navbar from "./components/app/Navbar";
import TabsBar from "./components/app/TabsBar";
import { countFileLines, readFileContent } from "@/lib/utils";
import type { Example, Tab } from "@/lib/types/types";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [activeView, setActiveView] = useState<string>("Code");
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [playing, setPlaying] = useState(false);

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
      // Define all examples to load
      const exampleConfigs = [
        { name: "1ff_no_rst_VTR", index: 0 },
        { name: "1ff_VTR", index: 1 },
        { name: "2ffs_no_rst_VTR", index: 2 },
        { name: "2ffs_VTR", index: 3 },
        { name: "5ffs_VTR", index: 4 },
        { name: "FULLLUT_VTR", index: 5 },
        { name: "LUT_VTR", index: 6 },
      ];

      // Process all examples in parallel
      const loadedExamples = await Promise.all(
        exampleConfigs.map(async ({ name, index }) => {
          // Updated to use public directory path which works in both dev and production
          const basePath = `/data/samples/${name}`;

          // Load all files in parallel
          const [
            originalVerilogFile,
            postSynthesisVerilogFile,
            postSynthesisSdfFile,
          ] = await Promise.all([
            readFileContent(`${basePath}/${name}.v`),
            readFileContent(`${basePath}/PS_${name}.v`),
            readFileContent(`${basePath}/PS_${name}.sdf`),
          ]);

          // Count lines
          const lineCount = await countFileLines(originalVerilogFile);

          return {
            index,
            example: {
              originalVerilogFile,
              postSynthesisVerilogFile,
              postSynthesisSdfFile,
              jsonOutput: null,
              originalVerilogFileInformation: {
                name: originalVerilogFile.name.split(".")[0],
                lineCount,
                fileSize: originalVerilogFile.size,
              },
            },
          };
        })
      );

      // Update the examples state once with all loaded examples
      setExamples((prevExamples) => {
        const newExamples = [...prevExamples];
        loadedExamples.forEach(({ index, example }) => {
          newExamples[index] = example;
        });
        return newExamples;
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
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        activeTabId={activeTabId} 
        examples={examples} 
        playing={playing} 
        setPlaying={setPlaying} 
      />
      <TabsBar 
        setActiveTabId={setActiveTabId} 
        tabs={tabs} 
        activeTabId={activeTabId}
        setTabs={setTabs} 
      />
      <TabDisplayer
        activeView={activeView}
        activeTabId={activeTabId}
        examples={examples}
        tabs={tabs}
        isLoading={isLoading}
        playing={playing}
      />
      <Toaster />
    </>
  );
}

export default App;
