import type { IConnection, IElement, IDataStructure } from "@/lib/types/types";

/**
 * Tokenizes the content of an SDF file into an array of relevant tokens for easier parsing.
 * @param {string} content - The raw content of an SDF file.
 * @returns {string[]} - An array of tokenized words from the SDF content.
 */
export function tokenizeSDF(content: string): string[] {
  return content
    .replace(/\(|\)/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Extracts timing delays (min, typical, max) from an SDF token array starting at the given index.
 * @param {string[]} tokens - Tokenized SDF content.
 * @param {number} index - The current index in the token list where timing data might be located.
 * @returns {{ min?: number, typical?: number, max?: number }} - The extracted delay values.
 */
export function extractDelays(
  tokens: string[],
  index: number
): { min?: number; typical?: number; max?: number } {
  let delays: { min?: number; typical?: number; max?: number } = {};

  for (let i = index; i < tokens.length; i++) {
    const match = tokens[i].match(/(\d+(\.\d+)?):(\d+(\.\d+)?):(\d+(\.\d+)?)/);
    if (match) {
      delays.min = parseFloat(match[1]);
      delays.typical = parseFloat(match[3]);
      delays.max = parseFloat(match[5]);
      break;
    }
  }
  return delays;
}

/**
 * Browser-compatible function to parse SDF content from a string.
 * This function processes the provided content string instead of reading from a file.
 * @param {string} content - String content of the SDF file.
 * @returns {IDataStructure} - An object containing parsed elements and connections.
 */
export function parseSdfContent(content: string): IDataStructure {
  let output: IDataStructure = { elements: [], connections: [] };
  let elementId = 0;
  let connectionId = 1;
  let wireMap: Record<string, string> = {}; // Mapping of signal names to wire names

  try {
    const tokens = tokenizeSDF(content);
    let currentCellType = "";
    let currentInstance = "";
    let currentElement: IElement | null = null;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === "CELLTYPE") {
        currentCellType = tokens[i + 1].replace(/"/g, "");
      }
      if (tokens[i] === "INSTANCE") {
        currentInstance = tokens[i + 1];

        currentElement = {
          id: elementId++,
          name: currentInstance,
          x: null,
          y: null,
          type: currentCellType,
          inputs: [],
          outputs: [],
          internal_delay: 0,
          setup_time: 0,
        };

        output.elements.push(currentElement);
      }
      if (tokens[i] === "IOPATH" && currentElement) {
        const from = tokens[i + 1].replace(/\[|\]/g, "");
        const to = tokens[i + 2];

        // Extract delay values (min, typical, max)
        const delayValues = extractDelays(tokens, i + 3);
        const delay = delayValues.typical ?? 0.2;

        currentElement.internal_delay = delayValues.max ?? delay;
        currentElement.setup_time = delayValues.min ?? 0;

        const wireName = `wire_${connectionId++}`;
        wireMap[from] = wireName;

        const connection: IConnection = {
          id: connectionId++,
          name: wireName,
          type: "wire",
          color: "#000000",
          time: delay,
        };

        output.connections.push(connection);
        currentElement.outputs.push({ wireName, outputName: to || `output_${connectionId}` });
        currentElement.inputs.push({ wireName, inputName: from || `input_${connectionId}` });
      }
    }
  } catch (err) {
    console.error("Error parsing SDF content:", err);
  }

  return output;
}

/**
 * Parses an SDF file and transforms it into a JSON object.
 * This function reads the content of an SDF file, processes it using parseSdfContent,
 * and returns the parsed data structure.
 * @param {File} file - The SDF (.sdf) File object.
 * @returns {Promise<IDataStructure>} - JSON object containing parsed elements and connections.
 */
export async function getJsonObjectFromSdf(
  file: File
): Promise<IDataStructure> {
  try {
    const content = await file.text();
    // Call the exported version of parseSdfContent to ensure the spy works
    return exports.parseSdfContent(content);
  } catch (error) {
    console.error("Error processing SDF file:", error);
    return { elements: [], connections: [] };
  }
}
