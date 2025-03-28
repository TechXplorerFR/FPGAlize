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

          // Parse the post-synthesis files to get the JSON output
          // const jsonOutput = await parseFilesForBrowser(
          //   postSynthesisVerilogFile,
          //   postSynthesisSdfFile
          // );

          const jsonOutput: IDataStructure = {
            elements: [
              {
                id: 0,
                name: "clk",
                type: "clk",
                inputs: [],
                outputs: [
                  {
                    wireName: "wire_1",
                    outputName: null,
                  },
                ],
                internal_delay: 0,
                setup_time: 0,
                x: 50,
                y: 100,
              },
              {
                id: 1,
                name: "D",
                type: "module_input",
                inputs: [],
                outputs: [
                  {
                    wireName: "wire_2",
                    outputName: null,
                  },
                ],
                internal_delay: 0,
                setup_time: 0,
                x: 50,
                y: 100,
              },
              {
                id: 2,
                name: "Q",
                type: "module_output",
                inputs: [
                  {
                    wireName: "wire_3",
                    inputName: null,
                  },
                ],
                outputs: [],
                internal_delay: 0,
                setup_time: 0,
                x: 50,
                y: 100,
              },
              {
                id: 3,
                name: "$procdff$3",
                type: "DFF",
                inputs: [
                  {
                    wireName: "wire_1",
                    inputName: "clk",
                  },
                  {
                    wireName: "wire_2",
                    inputName: "D",
                  },
                  {
                    wireName: "wire_4",
                    inputName: "async_reset",
                  },
                ],
                outputs: [
                  {
                    wireName: "wire_3",
                    outputName: "Q",
                  },
                ],
                internal_delay: 303,
                setup_time: -46,
                x: 50,
                y: 100,
              },
              {
                id: 4,
                name: "async_reset",
                type: "module_input",
                inputs: [],
                outputs: [
                  {
                    wireName: "wire_4",
                    outputName: null,
                  },
                ],
                internal_delay: 0,
                setup_time: 0,
                x: 50,
                y: 100,
              },
            ],
            connections: [
              {
                id: 1,
                name: "wire_1",
                type: "wire",
                color: "#000000",
                time: 10,
              },
              {
                id: 2,
                name: "wire_2",
                type: "wire",
                color: "#000000",
                time: 1022.2,
              },
              {
                id: 3,
                name: "wire_3",
                type: "wire",
                color: "#000000",
                time: 1079.77,
              },
              {
                id: 4,
                name: "wire_4",
                type: "wire",
                color: "#000000",
                time: 10,
              },
            ],
          };

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
