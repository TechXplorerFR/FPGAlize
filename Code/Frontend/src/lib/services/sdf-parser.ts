import type { IConnection, IElement, IDataStructure } from "@/lib/types";
import fs from 'node:fs/promises';

/**
 * Tokenizes the content of an SDF file into an array of relevant tokens for easier parsing.
 * @param {string} content - The raw content of an SDF file.
 * @returns {string[]} - An array of tokenized words from the SDF content.
 */
function tokenizeSDF(content: string): string[] {
    return content
        .replace(/\(|\)/g, " ")
        .split(/\s+/)
        .filter(token => token.length > 0);
}

/**
 * Extracts timing delays (min, typical, max) from an SDF token array starting at the given index.
 * @param {string[]} tokens - Tokenized SDF content.
 * @param {number} index - The current index in the token list where timing data might be located.
 * @returns {{ min?: number, typical?: number, max?: number }} - The extracted delay values.
 */
function extractDelays(tokens: string[], index: number): { min?: number; typical?: number; max?: number } {
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
 * Parses an SDF file and extracts electronic elements and connections.
 * @param {string} filePath - Path to the SDF file to be parsed.
 * @returns {Promise<IDataStructure>} - An object containing parsed elements and connections.
 */
async function parseSDFFile(filePath: string): Promise<IDataStructure> {
    let output: IDataStructure = { elements: [], connections: [] };
    let elementId = 1;
    let connectionId = 1;

    try {
        const fileContent = await fs.readFile(filePath, "utf8");
        const tokens = tokenizeSDF(fileContent);
        let currentCellType = "";
        let currentInstance = "";
        let currentElement: IElement | null = null;

        // Iterate through the tokens to parse the SDF content.
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === "CELLTYPE") {
                currentCellType = tokens[i + 1].replace(/"/g, "");
            }
            if (tokens[i] === "INSTANCE") {
                currentInstance = tokens[i + 1];

                currentElement = {
                    id: elementId++,
                    name: currentInstance,
                    type: currentCellType,
                    innerText: `Element of type ${currentCellType}`,
                    icon: "path-to-an-icon",
                    clicked: false,
                    inputs: [],
                    outputs: []
                };

                output.elements.push(currentElement);
            }
            if (tokens[i] === "IOPATH" && currentElement) {
                const from = tokens[i + 1].replace(/\[|\]/g, "");
                const to = tokens[i + 2];

                // Extract timing delay values (min, typical, max) for the connection.
                const delayValues = extractDelays(tokens, i + 3);
                const delay = delayValues.typical ?? 0.2;

                const connection: IConnection = {
                    id: connectionId++,
                    from: `${currentInstance}.${from}`,
                    fromLabel: "input",
                    to: `${currentInstance}.${to}`,
                    toLabel: "output",
                    color: "red",
                    time: delay
                };

                output.connections.push(connection);
                currentElement.outputs.push(to);
                currentElement.inputs.push(from);
            }
        }
    } catch (err) {
        console.error("Error reading or parsing file:", err);
    }

    return output; // Return the parsed data structure.
}

/**
 * Parses an SDF file and transforms it into a JSON object representing elements and connections.
 * @param {string} sdfPath - Path to the SDF file to be parsed.
 * @returns {Promise<IDataStructure>} - A promise that resolves to the parsed data structure.
 */
export async function getJsonObjectFromSdf(sdfPath: string): Promise<IDataStructure> {
    return await parseSDFFile(sdfPath);
}