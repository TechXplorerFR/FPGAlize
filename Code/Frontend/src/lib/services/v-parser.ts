import type { IDataStructure, IElement, IElementInput, IElementOutput } from "@/lib/types/types";

/**
 * Tokenizes a Verilog file content into an array of relevant tokens.
 * This function processes the raw content of a Verilog (.v) file,
 * replacing certain characters and splitting the content into words
 * for easier parsing.
 * @param {string} content - The raw content of a Verilog (.v) file.
 * @returns {string[]} - Tokenized words for easier parsing.
 */
function tokenizeVerilog(content: string): string[] {
  return content
    .replace(/\(|\)|,|;/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Parses a Verilog file and extracts module definitions.
 * This function processes a Verilog file, identifying modules and
 * extracting their inputs and outputs. It builds an array of parsed
 * module elements with their associated connections.
 * @param {File} file - The Verilog (.v) File object.
 * @returns {Promise<IDataStructure>} - Parsed module elements with their connections.
 */
async function parseVerilogFile(file: File): Promise<IDataStructure> {
  let output: IDataStructure = { elements: [], connections: [] };
  let elementId = 1;

  try {
    const fileContent = await file.text();
    const tokens = tokenizeVerilog(fileContent);
    let currentModule = "";
    let moduleInputs: IElementInput[] = [];
    let moduleOutputs: IElementOutput[] = [];

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === "module") {
        currentModule = tokens[i + 1];
      }

      if (tokens[i] === "input") {
        moduleInputs.push({ wireName: "", inputName: tokens[i + 1]});
      }

      if (tokens[i] === "output") {
        moduleOutputs.push({ wireName: "", outputName: tokens[i + 1]});
      }

      if (tokens[i] === "endmodule") {
        if (currentModule) {
          output.elements.push({
            id: elementId++,
            name: currentModule,
            x: null,
            y: null,
            type: "verilog_module",
            inputs: moduleInputs,
            outputs: moduleOutputs,
            internal_delay: 0,
            setup_time: 0,
          });
        }
        currentModule = "";
        moduleInputs = [];
        moduleOutputs = [];
      }
    }
  } catch (err) {
    console.error("Error reading or parsing Verilog file:", err);
  }

  return output; // Return the parsed data structure.
}

/**
 * Browser-compatible function to parse Verilog content from a string.
 * This function processes the provided content string instead of reading from a file.
 * @param {string} content - String content of the Verilog file.
 * @returns {IDataStructure} - Parsed module elements with their connections.
 */
export function parseVerilogContent(content: string): IDataStructure {
  let output: IDataStructure = { elements: [], connections: [] };
  let elementId = 0;
  let connectionId = 1;
  let moduleInputs: IElement[] = [];
  let moduleOutputs: IElement[] = [];
  let wireMap: Record<string, string> = {}; // Map to track wires

  try {
    const tokens = tokenizeVerilog(content);
    let currentModule = "";

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === "module") {
        currentModule = tokens[i + 1];
      }

      if (tokens[i] === "input") {
        const inputName = tokens[i + 1];
        const wireName = `wire_${connectionId++}`;

        moduleInputs.push({
          id: elementId++,
          name: inputName,
          x: null,
          y: null,
          type: "module_input",
          inputs: [],
          outputs: [{ wireName, outputName: null }],
          internal_delay: 0,
          setup_time: 0,
        });

        wireMap[inputName] = wireName;
        output.connections.push({ id: connectionId, name: wireName, type: "wire", color: "#000000", time: 0 });
      }

      if (tokens[i] === "output") {
        const outputName = tokens[i + 1];
        const wireName = `wire_${connectionId++}`;

        moduleOutputs.push({
          id: elementId++,
          name: outputName,
          x: null,
          y: null,
          type: "module_output",
          inputs: [{ wireName, inputName: null }],
          outputs: [],
          internal_delay: 0,
          setup_time: 0,
        });

        wireMap[outputName] = wireName;
        output.connections.push({ id: connectionId++, name: wireName, type: "wire", color: "#000000", time: 0 });
      }
    }

    output.elements.push(...moduleInputs, ...moduleOutputs);
  } catch (err) {
    console.error("Error parsing Verilog content:", err);
  }

  return output;
}

/**
 * Parses a Verilog file and transforms it into a JSON object.
 * This function calls the `parseVerilogFile` function and returns the
 * parsed data structure in JSON format.
 * @param {File} file - The Verilog (.v) File object.
 * @returns {Promise<IDataStructure>} - JSON object containing parsed elements and connections.
 */
export async function getJsonObjectFromV(
  file: File
): Promise<IDataStructure> {
  return await parseVerilogFile(file);
}
