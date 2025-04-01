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

    // Create an element for this input port
    elements.push({
      id: elementIdCounter++,
      name: portName,
      type: portName === "clk" ? "clk" : "module_input",
      inputs: [],
      outputs: [
        {
          wireName: `${portName}_output_0_0`, // Use actual wire name instead of placeholder
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

    // Create an element for this output port
    elements.push({
      id: elementIdCounter++,
      name: portName,
      type: "module_output",
      inputs: [
        {
          wireName: `${portName}_input_0_0`, // Use actual wire name instead of placeholder
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
          wireName: wireName, // Use actual wire name instead of placeholder
          outputName: "Q",
        });
      } else if (portName === "D") {
        inputs.push({
          wireName: wireName, // Use actual wire name instead of placeholder
          inputName: "D",
        });
      } else if (portName === "enable") {
        inputs.push({
          wireName: wireName, // Use actual wire name instead of placeholder
          inputName: "enable",
        });
        hasEnableGate = true;
      } else if (portName === "clock") {
        inputs.push({
          wireName: wireName, // Use actual wire name instead of placeholder
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
          wireName: wireName, // Use actual wire name instead of placeholder
          outputName: portName,
        });
      } else {
        inputs.push({
          wireName: wireName, // Use actual wire name instead of placeholder
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
  const interconnectRegex = /fpga_interconnect\s+\\([^(]+)\s*\(\s*\.datain\(\\([^)]+)\s*\),\s*\.dataout\(\\([^)]+)\s*\)\s*\);/g;
  let interconnectMatch;

  while ((interconnectMatch = interconnectRegex.exec(content)) !== null) {
    const connectionName = interconnectMatch[1].split("segment_")[1].trim();
    const sourceName = interconnectMatch[2];
    const destinationName = interconnectMatch[3];
    
    // Create a connection with source and destination information
    connections.push({
      id: connectionIdCounter++,
      name: connectionName,
      type: "wire",
      color: "#000000", // Default color
      time: 0,         // Default time delay
      source: sourceName,
      destination: destinationName
    });
  }

  // Now link connections to elements by updating wireName fields
  for (const connection of connections) {
    // Find source element and update its output wireName
    for (const element of elements) {
      for (const output of element.outputs) {
        if (output.wireName === connection.source) {
          output.wireName = connection.name;
        }
      }
    }

    // Find destination element and update its input wireName
    for (const element of elements) {
      for (const input of element.inputs) {
        if (input.wireName === connection.destination) {
          input.wireName = connection.name;
        }
      }
    }
  }

  console.log({
    elements,
    connections,
  });

  return {
    elements,
    connections,
  };
}
