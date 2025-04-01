import type {
  IDataStructure,
  IElement,
  IElementInput,
  IElementOutput,
  IConnection,
} from "@/lib/types/types";

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
  const wireMap: Map<string, number> = new Map(); // Maps wire names to their connection IDs

  let elementIdCounter = 0;
  let connectionIdCounter = 0;

  // Parse module definition
  const moduleRegex = /module\s+(\w+)\s*\(([\s\S]*?)\);/;
  const moduleMatch = content.match(moduleRegex);

  if (!moduleMatch) {
    throw new Error("No module definition found in the Verilog content");
  }

  const portDefinition = moduleMatch[2];

  // Parse input and output ports
  const inputPortRegex = /input\s+\\(\w+)\s*,?/g;
  const outputPortRegex = /output\s+\\(\w+)\s*,?/g;

  let inputMatch;
  while ((inputMatch = inputPortRegex.exec(portDefinition)) !== null) {
    const portName = inputMatch[1];
    const wireName = `wire_${connectionIdCounter + 1}`;

    // Create a connection for this wire
    connections.push({
      id: ++connectionIdCounter,
      name: wireName,
      type: "wire",
      color: "#000000",
      time: 0,
    });

    wireMap.set(portName, connectionIdCounter);

    // Create an element for this input port
    elements.push({
      id: elementIdCounter++,
      name: portName,
      type: portName === "clk" ? "clk" : "module_input",
      inputs: [],
      outputs: [
        {
          wireName,
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
    const wireName = `wire_${connectionIdCounter + 1}`;

    // Create a connection for this wire
    connections.push({
      id: ++connectionIdCounter,
      name: wireName,
      type: "wire",
      color: "#000000",
      time: 0,
    });

    wireMap.set(portName, connectionIdCounter);

    // Create an element for this output port
    elements.push({
      id: elementIdCounter++,
      name: portName,
      type: "module_output",
      inputs: [
        {
          wireName,
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

  // Parse wire declarations
  const wireRegex = /wire\s+\\(\w+)\s*;/g;
  let wireMatch;

  while ((wireMatch = wireRegex.exec(content)) !== null) {
    const wireName = wireMatch[1];
    if (!wireMap.has(wireName)) {
      connections.push({
        id: ++connectionIdCounter,
        name: `wire_${connectionIdCounter}`,
        type: "wire",
        color: "#000000",
        time: 0,
      });
      wireMap.set(wireName, connectionIdCounter);
    }
  }

  // Parse cell instances
  const cellRegex = /(\w+)\s+(?:#\([^)]*\))?\s*\\(\w+)\s*\(([\s\S]*?)\);/g;
  let cellMatch;

  while ((cellMatch = cellRegex.exec(content)) !== null) {
    if (cellMatch[1] === "fpga_interconnect") {
      continue; // Skip interconnect instances
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

      // Create a connection for this wire if it doesn't exist
      if (!wireMap.has(wireName)) {
        connections.push({
          id: ++connectionIdCounter,
          name: `wire_${connectionIdCounter}`,
          type: "wire",
          color: "#000000",
          time: 0,
        });
        wireMap.set(wireName, connectionIdCounter);
      }

      const wireId = wireMap.get(wireName);
      const connectionWireName = `wire_${wireId}`;

      // Determine if this is an input or output port based on typical port names
      // This is simplified and might need refinement for more complex Verilog
      if (portName === "Q" || portName.startsWith("Y")) {
        outputs.push({
          wireName: connectionWireName,
          outputName: portName,
        });
      } else {
        inputs.push({
          wireName: connectionWireName,
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

  // Add enable element if needed (similar to the example)
  if (!elements.some((el) => el.name === "enable")) {
    const wireName = `wire_${connectionIdCounter + 1}`;

    connections.push({
      id: ++connectionIdCounter,
      name: wireName,
      type: "wire",
      color: "#000000",
      time: 0,
    });

    elements.push({
      id: elementIdCounter++,
      name: "enable",
      type: "module_input",
      inputs: [],
      outputs: [
        {
          wireName,
          outputName: null,
        },
      ],
      internal_delay: 0,
      setup_time: 0,
      x: 50,
      y: 100,
    });
  }

  return {
    elements,
    connections,
  };
}
