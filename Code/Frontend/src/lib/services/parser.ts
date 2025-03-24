import { type IDataStructure } from "@/lib/types/types";
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
 * Parses both Verilog and SDF files and merges them into a single JSON object.
 * This function combines the parsing of both Verilog (.v) and SDF (.sdf) files,
 * and merges their results into a single structure that includes both elements
 * and connections.
 * @param {string} verilogPath - Path to the Verilog (.v) file.
 * @param {string} sdfPath - Path to the SDF file.
 * @returns {Promise<string>} - JSON string containing merged elements and connections from both files.
 */
export async function getJsonObjectFromParsing(
  verilogFile: File,
  sdfFile: File
): Promise<IDataStructure | string> {
  // Check if provided files have the correct extensions
  if (
    !checkFileExtension(verilogFile.name, "v") ||
    !checkFileExtension(sdfFile.name, "sdf")
  ) {
    return "Provided files are not valid .v and .sdf files.";
  }

  // Parse Verilog and SDF files
  const verilogData: IDataStructure = await v_parser.getJsonObjectFromV(
    verilogFile
  );
  const sdfData: IDataStructure = await sdf_parser.getJsonObjectFromSdf(
    sdfFile
  );

  // Merge the parsed data from both files
  const mergedData: IDataStructure = {
    elements: [...verilogData.elements, ...sdfData.elements],
    connections: [...verilogData.connections, ...sdfData.connections],
  };

  console.log(mergedData);

  // Return the merged data as a formatted JSON string
  return mergedData;
}

/**
 * Browser-compatible version that parses Verilog and SDF files from File objects.
 * This function combines the parsing of both Verilog (.v) and SDF (.sdf) File objects,
 * and merges their results into a single structure for browser environments.
 * @param {File} verilogFile - The Verilog (.v) File object.
 * @param {File} sdfFile - The SDF (.sdf) File object.
 * @returns {Promise<IDataStructure>} - JSON object containing merged elements and connections.
 */
export async function parseFilesForBrowser(
  verilogFile: File,
  sdfFile: File
): Promise<IDataStructure | null> {
  try {
    // Check file extensions
    if (
      !checkFileExtension(verilogFile.name, "v") ||
      !checkFileExtension(sdfFile.name, "sdf")
    ) {
      console.error("Provided files are not valid .v and .sdf files.");
      return null;
    }

    // Get file contents as strings
    const verilogContent = await getFileContent(verilogFile);
    const sdfContent = await getFileContent(sdfFile);

    // Parse the file contents
    const verilogData = await parseVerilogContent(verilogContent);
    const sdfData = await parseSdfContent(sdfContent);

    // Merge the parsed data
    const mergedData: IDataStructure = {
      elements: [...verilogData.elements, ...sdfData.elements],
      connections: [...verilogData.connections, ...sdfData.connections],
    };

    return mergedData;
  } catch (error) {
    console.error("Error parsing files:", error);
    return null;
  }
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
