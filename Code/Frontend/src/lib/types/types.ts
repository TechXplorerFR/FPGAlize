/**
 * Represents a file in the drawer.
 * @typedef {Object} FileInformation
 * @property {string} name - Name of the file.
 * @property {number} lineCount - Number of lines in the file.
 * @property {number} fileSize - Size of the file in bytes.
 */
export type FileInformation = {
  name: string;
  lineCount: number;
  fileSize: number;
};

/**
 * Represents a tab in the tabs bar.
 * @typedef {Object} Tab
 * @property {string} name - Name of the tab.
 * @property {string} id - Unique identifier for the tab.
 * @property {Example} example - Reference to the example data associated with this tab.
 */
export type Tab = {
  name: string;
  id: string;
  example: Example;
};

/**
 * Represents an electronic component or module in the design.
 * @typedef {Object} IElement
 * @property {number} id - Unique identifier for the element.
 * @property {string} name - Name of the element (instance name in SDF, module name in Verilog).
 * @property {string} type - Type of the element (e.g., module, gate, etc.).
 * @property {string} innerText - Description or metadata about the element.
 * @property {string} icon - Path to an icon representing the element.
 * @property {boolean} clicked - Boolean flag for UI interaction.
 * @property {string[]} inputs - List of input signals for the element.
 * @property {string[]} outputs - List of output signals for the element.
 */
export type IElement = {
  id: number;
  name: string; // Keep as required, but we'll handle undefined values in the code
  x: number | null;
  y: number | null;
  type: string;
  inputs: IElementInput[];
  outputs: IElementOutput[];
  internal_delay: number;
  setup_time: number;
};

/**
 * Represents an input signal for an electronic component.
 * @typedef {Object} IElementInput
 * @property {string} wireName - Name of the wire connected to the input.
 * @property {string} inputName - Name of the input signal.
 */
export type IElementInput = {
  wireName: string;
  inputName: string | null;
};

/**
 * Represents an output signal for an electronic component.
 * @typedef {Object} IElementOutput
 * @property {string} wireName - Name of the wire connected to the output.
 * @property {string} outputName - Name of the output signal.
 */
export type IElementOutput = {
  wireName: string;
  outputName: string | null;
};

/**
 * Represents a connection between two electronic components.
 * @typedef {Object} IConnection
 * @property {number} id - Unique identifier for the connection.
 * @property {string} name - Name of the connection (e.g., wire name).
 * @property {string} type - Type of the connection (e.g., wire).
 * @property {string} color - Color representation of the connection.
 * @property {number} time - Time delay associated with the connection.
 */
export type IConnection = {
  id: number;
  name: string;
  type: "wire";
  color: string;
  time: number;
};

/**
 * Represents the complete parsed data structure, including elements and connections.
 * This type defines the structure of the parsed data that combines elements
 * from Verilog and connections from SDF.
 * @typedef {Object} IDataStructure
 * @property {IElement[]} elements - List of parsed elements from Verilog and SDF.
 * @property {IConnection[]} connections - List of parsed connections from SDF.
 */
export type IDataStructure = {
  elements: IElement[];
  connections: IConnection[];
};

/**
 * Represents an example with its associated files and parsed JSON output.
 * This type defines the structure of an example that includes the original
 * Verilog file, post-synthesis Verilog file, post-synthesis SDF file, and
 * the parsed JSON output from the combined Verilog and SDF files.
 * @typedef {Object} Example
 * @property {File} originalVerilogFile - Original Verilog file for the example.
 * @property {File} postSynthesisVerilogFile - Post-synthesis Verilog file for the example.
 * @property {File} postSynthesisSdfFile - Post-synthesis SDF file for the example.
 * @property {IDataStructure | null} jsonOutput - Parsed JSON output from the example files.
 */
export type Example = {
  originalVerilogFile: File;
  postSynthesisVerilogFile: File;
  postSynthesisSdfFile: File;
  jsonOutput: IDataStructure | null;
  originalVerilogFileInformation: FileInformation;
};

/**
 * Represents the endpoints of a connection between two elements.
 * This type defines the structure of the connection endpoints, including
 * the source and destination elements, ports, and the connection itself.
 * @typedef {Object} ConnectionEndpoints
 * @property {IConnection} connection - The connection object between the elements.
 * @property {IElement} sourceElement - The source element where the connection starts.
 * @property {IElement} destElement - The destination element where the connection ends.
 * @property {string} sourcePort - The output port of the source element.
 * @property {string} destPort - The input port of the destination element.
 */
export type ConnectionEndpoints = {
  connection: IConnection;
  sourceElement: IElement;
  destElement: IElement;
  sourcePort: string;
  destPort: string;
};