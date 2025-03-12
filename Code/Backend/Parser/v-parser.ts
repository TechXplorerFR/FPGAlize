import { promises as fs } from "fs";
import { IDataStructure } from "./parser";

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
        .filter(token => token.length > 0);
}

/**
 * Parses a Verilog file and extracts module definitions.
 * This function processes a Verilog file, identifying modules and 
 * extracting their inputs and outputs. It builds an array of parsed 
 * module elements with their associated connections.
 * @param {string} filePath - Path to the Verilog (.v) file.
 * @returns {Promise<IDataStructure>} - Parsed module elements with their connections.
 */
async function parseVerilogFile(filePath: string): Promise<IDataStructure> {
    let output: IDataStructure = { elements: [], connections: [] };
    let elementId = 1;

    try {
        const fileContent = await fs.readFile(filePath, "utf8");
        const tokens = tokenizeVerilog(fileContent);
        let currentModule = "";
        let moduleInputs: string[] = [];
        let moduleOutputs: string[] = [];

        for (let i = 0; i < tokens.length; i++) {
            
            if (tokens[i] === "module") {
                currentModule = tokens[i + 1];
            }
            
            if (tokens[i] === "input") {
                moduleInputs.push(tokens[i + 1]);
            }
            
            if (tokens[i] === "output") {
                moduleOutputs.push(tokens[i + 1]);
            }
            
            if (tokens[i] === "endmodule") {
                if (currentModule) {
                    output.elements.push({
                        id: elementId++,
                        name: currentModule,
                        type: "verilog_module",
                        innerText: `Module ${currentModule}`,
                        icon: "path-to-an-icon",
                        clicked: false,
                        inputs: moduleInputs,
                        outputs: moduleOutputs
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
 * Parses a Verilog file and transforms it into a JSON object.
 * This function calls the `parseVerilogFile` function and returns the 
 * parsed data structure in JSON format.
 * @param {string} sdfPath - Path to the Verilog file.
 * @returns {Promise<IDataStructure>} - JSON object containing parsed elements and connections.
 */
export async function getJsonObjectFromV(sdfPath: string): Promise<IDataStructure> {
    return await parseVerilogFile(sdfPath);
}