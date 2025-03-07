import { promises as file } from "fs";

interface IElement {
    id: number;
    name: string;
    type: string;
    innerText: string;
    icon: string;
    clicked: boolean;
    inputs: string[];
    outputs: string[];
}

interface IConnection {
    id: number;
    from: string;
    fromLabel: string;
    to: string;
    toLabel: string;
    color: string;
    time: number;
}

interface IDataStructure {
    elements: IElement[];
    connections: IConnection[];
}

export async function parseSDFFile(filePath: string): Promise<IDataStructure> {
    let output: IDataStructure = {
        elements: [],
        connections: []
    };

    try {
        const fileContent = await file.readFile(filePath, 'utf8');
        const lines = fileContent.split('\n');
        let elementId = 1;
        let connectionId = 1;

        for (const line of lines) {
            const trimmedLine = line.trim(); // Removing extra spaces

            // Look for the CELLTYPE, INSTANCE, and DELAY keywords to identify elements
            if (trimmedLine.startsWith('(CELLTYPE')) {
                const cellType = trimmedLine.match(/\("([^"]+)"\)/)?.[1] || '';
                const instance = lines[lines.indexOf(line) + 1]?.match(/\("([^"]+)"\)/)?.[1] || '';

                // create one element for each cell
                const element: IElement = {
                    id: elementId++,
                    name: instance,
                    type: cellType,
                    innerText: `Element of type ${cellType}`,
                    icon: 'path-to-an-icon',
                    clicked: false,
                    inputs: [],
                    outputs: []
                };

                output.elements.push(element);
            }

            // Look for DELAY keyword to create connections
            if (trimmedLine.startsWith('(DELAY')) {
                const fromInstance = lines[lines.indexOf(line) - 1]?.match(/\("([^"]+)"\)/)?.[1] || '';
                const toInstance = lines[lines.indexOf(line) + 1]?.match(/\("([^"]+)"\)/)?.[1] || '';

                const connection: IConnection = {
                    id: connectionId++,
                    from: fromInstance,
                    fromLabel: 'output',  
                    to: toInstance,
                    toLabel: 'input',  
                    color: 'red',
                    time: 0.2 // timing data
                };

                output.connections.push(connection);
            }
        }
    } catch (err) {
        console.error("Error reading or parsing file:", err);
    }

    return output;
}


function attributeIds<T extends { id: number }>(list: T[]) {
    list.forEach((element, index) => {
        element.id = index + 1;
    });
}

export function getJsonObejctFromSdfFile() {
    (async () => {
        const result = await parseSDFFile('test.sdf');
        console.log(JSON.stringify(result, null, 2));
        file.writeFile("output.json", JSON.stringify(result, null, 2));
    })();
}
