import { useState, useEffect } from "react";
import TabDisplayer from "./components/app/TabDisplayer";
import ExamplesDrawer from "./components/app/ExamplesDrawer";
import Navbar from "./components/app/Navbar";
import TabsBar from "./components/app/TabsBar";
import { countFileLines, readFileContent } from "@/lib/utils";
import type { Example, Tab } from "@/lib/types/types";
import { Toaster } from "@/components/ui/sonner";
import { parseFilesForBrowser } from "@/lib/services/parser";
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

          const jsonOutput = {
            "elements": [
                {
                    "id": 0,
                    "name": "D",
                    "type": "module_input",
                    "inputs": [],
                    "outputs": [
                        {
                            "wireName": "wire_1",
                            "outputName": "DFF_Q1"
                        }
                    ],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 100,
                    "y": 100
                },
                {
                    "id": 1,
                    "name": "clk",
                    "type": "clk",
                    "inputs": [],
                    "outputs": [
                        {
                            "wireName": "wire_2",
                            "outputName": "CLK"
                        },
                        {
                            "wireName": "wire_3",
                            "outputName": "CLK"
                        },
                        {
                            "wireName": "wire_4",
                            "outputName": "CLK"
                        },
                        {
                            "wireName": "wire_5",
                            "outputName": "CLK"
                        },
                        {
                            "wireName": "wire_6",
                            "outputName": "CLK"
                        }
                    ],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 100,
                    "y": 200
                },
                {
                    "id": 2,
                    "name": "enable",
                    "type": "module_input",
                    "inputs": [],
                    "outputs": [
                        {
                            "wireName": "wire_7",
                            "outputName": "enable"
                        },
                        {
                            "wireName": "wire_8",
                            "outputName": "enable"
                        },
                        {
                            "wireName": "wire_9",
                            "outputName": "enable"
                        },
                        {
                            "wireName": "wire_10",
                            "outputName": "enable"
                        },
                        {
                            "wireName": "wire_11",
                            "outputName": "enable"
                        }
                    ],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 100,
                    "y": 300
                },
                {
                    "id": 3,
                    "name": "Q",
                    "type": "module_output",
                    "inputs": [
                        {
                            "wireName": "wire_16",
                            "inputName": "DFF_Q5"
                        }
                    ],
                    "outputs": [],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 1000,
                    "y": 100
                },
                {
                    "id": 4,
                    "name": "DFF_Q1",
                    "type": "DFF",
                    "inputs": [
                        {
                            "wireName": "wire_1",
                            "inputName": "D"
                        },
                        {
                            "wireName": "wire_2",
                            "inputName": "CLK"
                        },
                        {
                            "wireName": "wire_7",
                            "inputName": "enable"
                        }
                    ],
                    "outputs": [
                        {
                            "wireName": "wire_12",
                            "outputName": "DFF_Q2"
                        }
                    ],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 300,
                    "y": 100
                },
                {
                    "id": 5,
                    "name": "DFF_Q2",
                    "type": "DFF",
                    "inputs": [
                        {
                            "wireName": "wire_12",
                            "inputName": "DFF_Q1"
                        },
                        {
                            "wireName": "wire_3",
                            "inputName": "CLK"
                        },
                        {
                            "wireName": "wire_8",
                            "inputName": "enable"
                        }
                    ],
                    "outputs": [
                        {
                            "wireName": "wire_13",
                            "outputName": "DFF_Q3"
                        }
                    ],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 300,
                    "y": 100
                },
                {
                    "id": 6,
                    "name": "DFF_Q3",
                    "type": "DFF",
                    "inputs": [
                        {
                            "wireName": "wire_13",
                            "inputName": "DFF_Q2"
                        },
                        {
                            "wireName": "wire_4",
                            "inputName": "CLK"
                        },
                        {
                            "wireName": "wire_9",
                            "inputName": "enable"
                        }
                    ],
                    "outputs": [
                        {
                            "wireName": "wire_14",
                            "outputName": "DFF_Q4"
                        }
                    ],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 300,
                    "y": 100
                },
                {
                    "id": 7,
                    "name": "DFF_Q4",
                    "type": "DFF",
                    "inputs": [
                        {
                            "wireName": "wire_14",
                            "inputName": "DFF_Q3"
                        },
                        {
                            "wireName": "wire_5",
                            "inputName": "CLK"
                        },
                        {
                            "wireName": "wire_10",
                            "inputName": "enable"
                        }
                    ],
                    "outputs": [
                        {
                            "wireName": "wire_15",
                            "outputName": "DFF_Q5"
                        }
                    ],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 300,
                    "y": 100
                },
                {
                    "id": 8,
                    "name": "DFF_Q5",
                    "type": "DFF",
                    "inputs": [
                        {
                            "wireName": "wire_15",
                            "inputName": "DFF_Q4"
                        },
                        {
                            "wireName": "wire_6",
                            "inputName": "CLK"
                        },
                        {
                            "wireName": "wire_11",
                            "inputName": "enable"
                        }
                    ],
                    "outputs": [
                        {
                            "wireName": "wire_16",
                            "outputName": "Q"
                        }
                    ],
                    "internal_delay": 0,
                    "setup_time": 0,
                    "x": 300,
                    "y": 100
                }
            ],
            "connections": [
                {
                    "id": 0,
                    "name": "wire_1",
                    "type": "wire",
                    "color": "#0000FF",
                    "time": 0,
                    "source": "D",
                    "destination": "DFF_Q1"
                },
                {
                    "id": 1,
                    "name": "wire_2",
                    "type": "wire",
                    "color": "#FF0000",
                    "time": 0,
                    "source": "clk",
                    "destination": "DFF_Q1"
                },
                {
                    "id": 2,
                    "name": "wire_3",
                    "type": "wire",
                    "color": "#FF0000",
                    "time": 0,
                    "source": "clk",
                    "destination": "DFF_Q2"
                },
                {
                    "id": 3,
                    "name": "wire_4",
                    "type": "wire",
                    "color": "#FF0000",
                    "time": 0,
                    "source": "clk",
                    "destination": "DFF_Q3"
                },
                {
                    "id": 4,
                    "name": "wire_5",
                    "type": "wire",
                    "color": "#FF0000",
                    "time": 0,
                    "source": "clk",
                    "destination": "DFF_Q4"
                },
                {
                    "id": 5,
                    "name": "wire_6",
                    "type": "wire",
                    "color": "#FF0000",
                    "time": 0,
                    "source": "clk",
                    "destination": "DFF_Q5"
                },
                {
                    "id": 6,
                    "name": "wire_7",
                    "type": "wire",
                    "color": "#00FF00",
                    "time": 0,
                    "source": "enable",
                    "destination": "DFF_Q1"
                },
                {
                    "id": 7,
                    "name": "wire_8",
                    "type": "wire",
                    "color": "#00FF00",
                    "time": 0,
                    "source": "enable",
                    "destination": "DFF_Q2"
                },
                {
                    "id": 8,
                    "name": "wire_9",
                    "type": "wire",
                    "color": "#00FF00",
                    "time": 0,
                    "source": "enable",
                    "destination": "DFF_Q3"
                },
                {
                    "id": 9,
                    "name": "wire_10",
                    "type": "wire",
                    "color": "#00FF00",
                    "time": 0,
                    "source": "enable",
                    "destination": "DFF_Q4"
                },
                {
                    "id": 10,
                    "name": "wire_11",
                    "type": "wire",
                    "color": "#00FF00",
                    "time": 0,
                    "source": "enable",
                    "destination": "DFF_Q5"
                },
                {
                    "id": 11,
                    "name": "wire_12",
                    "type": "wire",
                    "color": "#0000FF",
                    "time": 0,
                    "source": "DFF_Q1",
                    "destination": "DFF_Q2"
                },
                {
                    "id": 12,
                    "name": "wire_13",
                    "type": "wire",
                    "color": "#0000FF",
                    "time": 0,
                    "source": "DFF_Q2",
                    "destination": "DFF_Q3"
                },
                {
                    "id": 13,
                    "name": "wire_14",
                    "type": "wire",
                    "color": "#0000FF",
                    "time": 0,
                    "source": "DFF_Q3",
                    "destination": "DFF_Q4"
                },
                {
                    "id": 14,
                    "name": "wire_15",
                    "type": "wire",
                    "color": "#0000FF",
                    "time": 0,
                    "source": "DFF_Q4",
                    "destination": "DFF_Q5"
                },
                {
                    "id": 15,
                    "name": "wire_16",
                    "type": "wire",
                    "color": "#0000FF",
                    "time": 0,
                    "source": "DFF_Q5",
                    "destination": "Q"
                }
            ]
        }
        

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
