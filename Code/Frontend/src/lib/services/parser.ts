import {
  IConnection,
  IElement,
  IElementInput,
  IElementOutput,
  type IDataStructure,
} from "@/lib/types/types";
import * as v_parser from "@/lib/services/v-parser";
import * as sdf_parser from "@/lib/services/sdf-parser";
import { getFileContent } from "@/lib/utils";

/**
 * Checks if a given file has the expected extension.
 * This function verifies that a file has the expected file extension
 * (e.g., .v for Verilog, .sdf for SDF).
 * @param fileName - The name of the file to check.
 * @param expectedExtension - The expected file extension (without the dot).
 * @returns {boolean} - Returns true if the file has the expected extension, false otherwise.
 */
function checkFileExtension(
  fileName: string,
  expectedExtension: string
): boolean {
  return fileName.split(".").pop()?.toLowerCase() === expectedExtension;
}

/**
 * Browser-compatible version that parses Verilog and SDF files from File objects.
 * This function combines the parsing of both Verilog (.v) and SDF (.sdf) File objects,
 * and merges their results into a single structure for browser environments.
 * @param {File} verilogFile - The Verilog (.v) File object.
 * @param {File} sdfFile - The SDF (.sdf) File object.
 * @returns {Promise<IDataStructure | null>} - JSON object containing merged elements and connections.
 */
export async function parseFilesForBrowser(
  verilogFile: File,
  sdfFile: File
): Promise<IDataStructure | null> {
  try {
    if (
      !checkFileExtension(verilogFile.name, "v") ||
      !checkFileExtension(sdfFile.name, "sdf")
    ) {
      console.error("Provided files are not valid .v and .sdf files.");
      return null;
    }

    const verilogContent = await getFileContent(verilogFile);
    const sdfContent = await getFileContent(sdfFile);

    const verilogData = parseVerilogContent(verilogContent);
    const sdfData = parseSdfContent(sdfContent);

    // Merge elements and connections
    const mergedElements = mergeElements(
      (await verilogData).elements,
      (await sdfData).elements
    );
    const mergedConnections = mergeConnections(
      (await verilogData).connections,
      (await sdfData).connections
    );

    // Clean up and finalize output
    const finalElements = finalizeElements(mergedElements);
    const finalConnections = finalizeConnections(mergedConnections);

    return { elements: finalElements, connections: finalConnections };
  } catch (error) {
    console.error("Error parsing files:", error);
    return null;
  }
}

function mergeElements(
  verilogElements: IElement[],
  sdfElements: IElement[]
): IElement[] {
  const merged: IElement[] = [];

  verilogElements.forEach((verilogElem) => {
    merged.push({ ...verilogElem });
  });

  sdfElements.forEach((sdfElem) => {
    const existingElem = merged.find((vElem) => vElem.name === sdfElem.name);
    if (existingElem) {
      existingElem.inputs = existingElem.inputs.concat(sdfElem.inputs);
      existingElem.outputs = existingElem.outputs.concat(sdfElem.outputs);
      existingElem.internal_delay = Math.max(
        existingElem.internal_delay,
        sdfElem.internal_delay
      );
      existingElem.setup_time = Math.max(
        existingElem.setup_time,
        sdfElem.setup_time
      );
    } else {
      merged.push({ ...sdfElem });
    }
  });

  return merged;
}

function mergeConnections(
  verilogConnections: IConnection[],
  sdfConnections: IConnection[]
): IConnection[] {
  const merged: IConnection[] = [];

  verilogConnections.forEach((verilogConn) => {
    merged.push({ ...verilogConn });
  });

  sdfConnections.forEach((sdfConn) => {
    const existingConn = merged.find((vConn) => vConn.name === sdfConn.name);
    if (existingConn) {
      existingConn.time = Math.max(existingConn.time, sdfConn.time);
    } else {
      merged.push({ ...sdfConn });
    }
  });

  return merged;
}

function finalizeElements(elements: IElement[]): IElement[] {
  return elements.map((elem, index) => {
    const cleanedName = cleanName(elem.name);
    return {
      ...elem,
      id: index, // Ensures unique IDs
      name: cleanedName,
      type: cleanType(cleanedName, elem.type, elem.inputs),
      inputs: cleanInputs(elem.inputs),
      outputs: cleanOutputs(elem.outputs),
    };
  });
}

function cleanName(name: string): string {
  return name.replace(/\\/g, ""); // Remove unwanted escape characters
}

function cleanType(
  name: string,
  type: string,
  inputs: IElementInput[]
): string {
  // Handle clock signal explicitly
  if (name === "clk") {
    return "clk";
  }

  // Handle D Flip-Flop (DFF) variations
  if (type === "DFF") {
    if (inputs.length < 2) {
      return "DFF_invalid"; // Not enough inputs for a proper DFF
    }
    return inputs.length < 3 ? "DFF" : "DFF_NE";
  }

  // Handle module inputs (no inputs present)
  if (inputs.length === 0) {
    return "module_input";
  }

  // Handle basic LUT logic
  if (inputs.length <= 4) {
    return `LUT${inputs.length}`;
  }

  return "unknown_type";
}

function cleanInputs(inputs: IElementInput[]): IElementInput[] {
  return inputs.map((input) => {
    if (!input.wireName) {
      throw new Error("WireName must be defined for all inputs.");
    }
    return {
      ...input,
      inputName: input.inputName,
    };
  });
}

function cleanOutputs(outputs: IElementOutput[]): IElementOutput[] {
  return outputs.map((output) => {
    if (!output.wireName) {
      throw new Error("WireName must be defined for all outputs.");
    }
    return {
      ...output,
      outputName: output.outputName,
    };
  });
}

function finalizeConnections(connections: IConnection[]): IConnection[] {
  return connections.map((conn, index) => ({
    ...conn,
    id: index, // Ensures unique IDs
    color: "#000000", // Default wire color
  }));
}

/**
 * Parses Verilog content string into structured data.
 * Browser-compatible version that doesn't rely on the filesystem.
 * @param {string} content - Verilog file content as string.
 * @returns {Promise<IDataStructure>} - Parsed elements and connections.
 */
async function parseVerilogContent(content: string): Promise<IDataStructure> {
  return v_parser.parseVerilogContent(content);
}

/**
 * Parses SDF content string into structured data.
 * Browser-compatible version that doesn't rely on the filesystem.
 * @param {string} content - SDF file content as string.
 * @returns {Promise<IDataStructure>} - Parsed elements and connections.
 */
async function parseSdfContent(content: string): Promise<IDataStructure> {
  return sdf_parser.parseSdfContent(content);
}
