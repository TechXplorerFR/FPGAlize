import { Example, IDataStructure } from "@/lib/types/types";
import { getFileContent } from "@/lib/utils";
// import { parseFilesForBrowser } from "@/lib/services/parser";

/**
 * Parses uploaded files into an Example object
 * @param originalVerilogFile Original Verilog file uploaded by the user
 * @param postSynthesisVerilogFile Post-synthesis Verilog file
 * @param postSynthesisSdfFile SDF file with timing information
 * @returns A Promise that resolves to an Example object
 */
export async function parseUploadedExample(
  originalVerilogFile: File,
  postSynthesisVerilogFile: File,
  postSynthesisSdfFile: File
): Promise<Example> {
  try {
    // Count lines in the original Verilog file
    const content = await getFileContent(originalVerilogFile);
    const lineCount = content ? content.split("\n").length : 0;

    // let jsonOutput = await parseFilesForBrowser(
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
              outputName: "CLK",
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
              inputName: "CLK",
            },
            {
              wireName: "wire_2",
              inputName: "D",
            },
            {
              wireName: "wire_4",
              inputName: "EN",
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
          name: "enable",
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

    // Return the formatted example object
    return {
      originalVerilogFile,
      postSynthesisVerilogFile,
      postSynthesisSdfFile,
      jsonOutput,
      originalVerilogFileInformation: {
        name: originalVerilogFile.name.split(".")[0],
        lineCount,
        fileSize: originalVerilogFile.size,
      },
    };
  } catch (error) {
    console.error("Error parsing uploaded files:", error);
    throw new Error(
      `Failed to parse files: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
