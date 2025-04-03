import type {
  IDataStructure,
  IElement,
  IElementInput,
  IElementOutput,
  IConnection,
} from "@/lib/types/types";

/**
 * Updates wire names in elements based on connections.
 * Ensures that all wireName fields in elements match the name of their associated connection.
 * @param {IElement[]} elements - Array of elements.
 * @param {IConnection[]} connections - Array of connections.
 */
function updateWireNames(elements: IElement[], connections: IConnection[]): void {
  for (const connection of connections) {
    const { source, destination, name } = connection;

    // Update source wire name in elements
    for (const element of elements) {
      for (const output of element.outputs) {
        if (output.wireName.trim() === source.trim()) {
          output.wireName = name;
        }
      }
    }

    // Update destination wire name in elements
    for (const element of elements) {
      for (const input of element.inputs) {
        if (input.wireName.trim() === destination.trim()) {
          input.wireName = name;
        }
      }
    }
  }
}

/**
 * Browser-compatible function to parse Verilog content from a string.
 * This function processes the provided content string instead of reading from a file.
 * @param {string} content - String content of the Verilog file.
 * @returns {IDataStructure} - Parsed module elements with their connections.
 */
export function parseVerilogContent(content: string): IDataStructure {
  // Initialize the result objects
  const elements: IElement[] = [];
  const connections: IConnection[] = [];

  let elementIdCounter = 0;
  let connectionIdCounter = 0;

  // Parse module definition
  const moduleRegex = /module\s+(\w+)\s*\(([\s\S]*?)\);/;
  const moduleMatch = content.match(moduleRegex);

  if (!moduleMatch) {
    throw new Error("No module definition found in the Verilog content");
  }

  const portDefinition = moduleMatch[2];

  // Extract IO assignments to map ports to their wire names
  const inputWireMap: Record<string, string> = {};
  const outputWireMap: Record<string, string> = {};
  
  // Match lines like: assign \I1_output_0_0  = \I1 ;
  const inputAssignRegex = /assign\s+\\(\w+(?:_output_\d+_\d+))\s*=\s*\\(\w+)\s*;/g;
  let inputAssignMatch;
  while ((inputAssignMatch = inputAssignRegex.exec(content)) !== null) {
    const wireName = inputAssignMatch[1];
    const portName = inputAssignMatch[2];
    inputWireMap[portName] = wireName;
  }
  
  // Match lines like: assign \O1  = \O1_input_0_0 ;
  const outputAssignRegex = /assign\s+\\(\w+)\s*=\s*\\(\w+(?:_input_\d+_\d+))\s*;/g;
  let outputAssignMatch;
  while ((outputAssignMatch = outputAssignRegex.exec(content)) !== null) {
    const portName = outputAssignMatch[1];
    const wireName = outputAssignMatch[2];
    outputWireMap[portName] = wireName;
  }

  // Parse input and output ports
  const inputPortRegex = /input\s+\\(\w+)\s*,?/g;
  const outputPortRegex = /output\s+\\(\w+)\s*,?/g;

  let inputMatch;
  while ((inputMatch = inputPortRegex.exec(portDefinition)) !== null) {
    const portName = inputMatch[1];
    const wireName = inputWireMap[portName] || `${portName}_output_0_0`; // Fallback if not found

    // Create an element for this input port
    elements.push({
      id: elementIdCounter++,
      name: portName,
      type: portName === "clk" ? "clk" : "module_input",
      inputs: [],
      outputs: [
        {
          wireName: wireName,
          outputName: portName === "clk" ? "CLK" : null,
        },
      ],
      internal_delay: 0,
      setup_time: 0,
      x: 50,
      y: 100,
    });
  }

  let outputMatch;
  while ((outputMatch = outputPortRegex.exec(portDefinition)) !== null) {
    const portName = outputMatch[1];
    const wireName = outputWireMap[portName] || `${portName}_input_0_0`; // Fallback if not found

    // Create an element for this output port
    elements.push({
      id: elementIdCounter++,
      name: portName,
      type: "module_output",
      inputs: [
        {
          wireName: wireName,
          inputName: null,
        },
      ],
      outputs: [],
      internal_delay: 0,
      setup_time: 0,
      x: 50,
      y: 100,
    });
  }

  // Parse DFF instances specifically
  const dffRegex = /DFF\s+#\([\s\S]*?\)\s*\\(\w+)\s*\(([\s\S]*?)\);/g;
  let dffMatch;

  while ((dffMatch = dffRegex.exec(content)) !== null) {
    const cellName = dffMatch[1];
    const portConnections = dffMatch[2];

    const inputs: IElementInput[] = [];
    const outputs: IElementOutput[] = [];
    let hasEnableGate: boolean = false;

    // Parse input and output port connections
    const portRegex = /\.(\w+)\s*\(\s*\\([^)]+)\s*\)/g;
    let portMatch;

    while ((portMatch = portRegex.exec(portConnections)) !== null) {
      const portName = portMatch[1];
      const wireName = portMatch[2];

      // For DFF, map the ports appropriately
      if (portName === "Q") {
        outputs.push({
          wireName: wireName,
          outputName: "Q",
        });
      } else if (portName === "D") {
        inputs.push({
          wireName: wireName,
          inputName: "D",
        });
      } else if (portName === "enable") {
        inputs.push({
          wireName: wireName,
          inputName: "enable",
        });
        hasEnableGate = true;
      } else if (portName === "clock") {
        inputs.push({
          wireName: wireName,
          inputName: "CLK",
        });
      }
    }

    // Create an element for this DFF
    elements.push({
      id: elementIdCounter++,
      name: cellName,
      type: hasEnableGate ? "DFF" : "DFF_NE",
      inputs,
      outputs,
      internal_delay: 0,
      setup_time: 0,
      x: 50,
      y: 100,
    });
  }

  // Parse other cell instances
  const cellRegex = /(\w+)\s+(?:#\([^)]*\))?\s*\\(\w+)\s*\(([\s\S]*?)\);/g;
  let cellMatch;

  while ((cellMatch = cellRegex.exec(content)) !== null) {
    if (cellMatch[1] === "fpga_interconnect" || cellMatch[1] === "DFF") {
      continue; // Skip interconnect instances and DFF (already processed)
    }

    const cellType = cellMatch[1];
    const cellName = cellMatch[2];
    const portConnections = cellMatch[3];

    const inputs: IElementInput[] = [];
    const outputs: IElementOutput[] = [];

    // Parse input and output port connections
    const portRegex = /\.(\w+)\(\\(\w+)\)/g;
    let portMatch;

    while ((portMatch = portRegex.exec(portConnections)) !== null) {
      const portName = portMatch[1];
      const wireName = portMatch[2];

      // Determine if this is an input or output port based on typical port names
      if (portName === "Q" || portName.startsWith("Y")) {
        outputs.push({
          wireName: wireName,
          outputName: portName,
        });
      } else {
        inputs.push({
          wireName: wireName,
          inputName: portName,
        });
      }
    }

    // Create an element for this cell
    elements.push({
      id: elementIdCounter++,
      name: cellName,
      type: cellType,
      inputs,
      outputs,
      internal_delay: 0,
      setup_time: 0,
      x: 50,
      y: 100,
    });
  }

  // Parse interconnect instances to create connections
  const interconnectRegex =
    /fpga_interconnect\s+\\([^(]+)\s*\(\s*\.datain\(\\([^)]+)\s*\),\s*\.dataout\(\\([^)]+)\s*\)\s*\);/g;
  let interconnectMatch;

  while ((interconnectMatch = interconnectRegex.exec(content)) !== null) {
    // Extract source and destination names
    const sourceName = interconnectMatch[2];
    const destinationName = interconnectMatch[3];

    // Create connection name in source_to_destination format
    const connectionName = `${sourceName}_to_${destinationName}`;

    // Create a connection with source and destination information
    connections.push({
      id: connectionIdCounter++,
      name: connectionName,
      type: "wire",
      color: "#000000", // Default color
      time: 0, // Default time delay
      source: sourceName,
      destination: destinationName,
    });
  }

  // Now link connections to elements by updating wireName fields
  updateWireNames(elements, connections);

  console.log({
    elements,
    connections,
  });

  return {
    elements,
    connections,
  };
}
