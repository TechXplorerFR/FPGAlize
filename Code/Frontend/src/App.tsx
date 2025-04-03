import { useState, useEffect } from "react";
import TabDisplayer from "./components/app/TabDisplayer";
import ExamplesDrawer from "./components/app/ExamplesDrawer";
import Navbar from "./components/app/Navbar";
import TabsBar from "./components/app/TabsBar";
import { countFileLines, readFileContent } from "@/lib/utils";
import type { Example, IDataStructure, Tab } from "@/lib/types/types";
import { Toaster } from "@/components/ui/sonner";
// import { parseFilesForBrowser } from "@/lib/services/parser";
import { toastMessage } from "@/lib/services/toast";

function App() {
  const [activeView, setActiveView] = useState<string>("Code");
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [playing, setPlaying] = useState(false);
  const [resetTriggered, setResetTriggered] = useState(false);

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
            jsonOutputFile,
          ] = await Promise.all([
            readFileContent(`${basePath}/${name}.v`),
            readFileContent(`${basePath}/PS_${name}.v`),
            readFileContent(`${basePath}/PS_${name}.sdf`),
            readFileContent(`${basePath}/${name}.json`),
          ]);

          // Count lines
          const lineCount = await countFileLines(originalVerilogFile);

          // Parse the post-synthesis files to get the JSON output
          // const jsonOutput = await parseFilesForBrowser(
          //   postSynthesisVerilogFile,
          //   postSynthesisSdfFile
          // );

          const jsonOutputString = await jsonOutputFile.text();
          const jsonOutput: IDataStructure = JSON.parse(jsonOutputString);

          if (!jsonOutput) {
            toastMessage.warning(`Failed to parse example: ${name}`);
          }

          return {
            index,
            example: {
              originalVerilogFile,
              postSynthesisVerilogFile,
              postSynthesisSdfFile,
              jsonOutput,
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
      console.error("Error loading example files:", error);
      toastMessage.error("Failed to load example files");
      setIsLoading(false);
    }
  }

  // Handle reset simulation function
  const handleResetSimulation = () => {
    setResetTriggered(true);
    // Reset the trigger after a short delay so it can be triggered again
    setTimeout(() => {
      setResetTriggered(false);
    }, 100);
  };

  // Load example files when the component mounts
  useEffect(() => {
    // Load built-in examples
    loadExampleFiles();

    // Load custom examples from sessionStorage
    try {
      const storedExamples = sessionStorage.getItem("customExamples");
      if (storedExamples) {
        const parsedExamples = JSON.parse(storedExamples);

        // Need to convert the serialized file info back to actual File objects
        // This is a simplified version - in a real implementation you'd need to
        // fetch the actual file content from wherever it's stored
        const processedExamples = parsedExamples.map((ex: any) => {
          return {
            ...ex,
            // Note: This is a mock representation since we can't recreate File objects
            // In a real implementation, you'd need to store file contents and recreate Files
            originalVerilogFile: new File([""], ex.originalVerilogFile.name, {
              type: ex.originalVerilogFile.type,
            }),
            postSynthesisVerilogFile: new File(
              [""],
              ex.postSynthesisVerilogFile.name,
              { type: ex.postSynthesisVerilogFile.type }
            ),
            postSynthesisSdfFile: new File([""], ex.postSynthesisSdfFile.name, {
              type: ex.postSynthesisSdfFile.type,
            }),
          };
        });

        setExamples((prevExamples) => [...prevExamples, ...processedExamples]);
      }
    } catch (error) {
      console.error(
        "Failed to load custom examples from sessionStorage:",
        error
      );
    }
  }, []);

  return (
    <>
      <ExamplesDrawer
        examples={examples}
        isLoading={isLoading}
        setTabs={setTabs}
        setActiveTabId={setActiveTabId}
        setExamples={setExamples}
      />
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        activeTabId={activeTabId}
        examples={examples}
        playing={playing}
        setPlaying={setPlaying}
        onResetSimulation={handleResetSimulation}
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
        resetTriggered={resetTriggered}
      />
      <Toaster />
    </>
  );
}

export default App;
