import {
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

    const verilogData = await parseVerilogContent(verilogContent);
    const returnedData = await parseSdfContent(sdfContent, verilogData);

    return returnedData;
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
async function parseSdfContent(content: string, verilogData: IDataStructure): Promise<IDataStructure> {
  return sdf_parser.parseSdfContent(content, verilogData);
}