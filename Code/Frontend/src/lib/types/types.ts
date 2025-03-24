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
 * @property {string} type - Type of the tab content (e.g., "verilog", "sdf").
 * @property {Example} example - Reference to the example data associated with this tab.
 */
export type Tab = {
  name: string;
  id: string;
  type: string;
  example: Example;
};

/**
 * Represents an element in the simulation canvas
 * @typedef {Object} Element
 * @property {number} id - Unique identifier for the element.
 * @property {number} x - X-coordinate of the element.
 * @property {number} y - Y-coordinate of the element.
 * @property {boolean} isDragging - Boolean flag for UI interaction.
 * @property {number[]} connectedTo - List of element IDs connected to this element.
 */
export type Element = {
  id: number;
  name: string;
  x: number;
  y: number;
  icon: string;
  isDragging: boolean;
  connectedTo: number[];
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
  name: string;
  type: string;
  innerText: string;
  icon: string;
  clicked: boolean;
  inputs: string[];
  outputs: string[];
};

/**
 * Represents a connection between two electronic components.
 * @typedef {Object} IConnection
 * @property {number} id - Unique identifier for the connection.
 * @property {string} from - Source signal name, including instance reference.
 * @property {string} fromLabel - Label describing the source signal.
 * @property {string} to - Destination signal name, including instance reference.
 * @property {string} toLabel - Label describing the destination signal.
 * @property {string} color - Visual color for the connection, typically for UI display.
 * @property {number} time - Delay in the connection (extracted from SDF timing values).
 */
export type IConnection = {
  id: number;
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
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
