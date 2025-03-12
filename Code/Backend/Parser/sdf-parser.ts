import { promises as fs } from "fs";

type IElement = {
    id: number;
    name: string;
    type: string;
    innerText: string;
    icon: string;
    clicked: boolean;
    inputs: string[];
    outputs: string[];
};

type IConnection = {
    id: number;
    from: string;
    fromLabel: string;
    to: string;
    toLabel: string;
    color: string;
    time: number;
};

type IDataStructure = {
    elements: IElement[];
    connections: IConnection[];
};

// Improved tokenizer for SDF parsing
function tokenizeSDF(content: string): string[] {
    return content
        .replace(/\(|\)/g, " ") // Replace parentheses with spaces
        .split(/\s+/)            // Split by whitespace
        .filter(token => token.length > 0);
}

// Extract min, typical, max delays from SDF
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
                const from = tokens[i + 1].replace(/\[|\]/g, ""); // Removing brackets
                const to = tokens[i + 2];

                // Extract all timing values from the IOPATH
                const delayValues = extractDelays(tokens, i + 3);
                const delay = delayValues.typical ?? 0.2; // Default delay

                const connection: IConnection = {
                    id: connectionId++,
                    from: `${currentInstance}.${from}`, // Ensure instance reference
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

    return output;
}

function checkFileExtension(fileName: string): boolean {
    let extension: string | undefined = fileName.split(`.`).pop();
    if (extension !== `sdf`) {
        return false;
    }
    return true;
}

export async function getJsonObjectFromSdfFile(path: string): Promise<string> {
    if (checkFileExtension(path)) {
        const result: IDataStructure = await parseSDFFile(path);
        return JSON.stringify(result, null, 2);
    }

    return "Provided file is not a .sdf file.";
}
