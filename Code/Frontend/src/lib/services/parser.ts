import { type IDataStructure } from "@/lib/types";
import * as v_parser from "@/lib/services/v-parser";
import * as sdf_parser from "@/lib/services/sdf-parser";

/**
 * Checks if a given file has the expected extension.
 * This function verifies that a file has the expected file extension 
 * (e.g., .v for Verilog, .sdf for SDF).
 * @param fileName - The name of the file to check.
 * @param expectedExtension - The expected file extension (without the dot).
 * @returns {boolean} - Returns true if the file has the expected extension, false otherwise.
 */
function checkFileExtension(fileName: string, expectedExtension: string): boolean {
    return fileName.split('.').pop()?.toLowerCase() === expectedExtension;
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
export async function getJsonObjectFromParsing(verilogPath: string, sdfPath: string): Promise<IDataStructure | string> {
    // Check if provided files have the correct extensions
    if (!checkFileExtension(verilogPath, "v") || !checkFileExtension(sdfPath, "sdf")) {
        return "Provided files are not valid .v and .sdf files.";
    }

    // Parse Verilog and SDF files
    const verilogData: IDataStructure = await v_parser.getJsonObjectFromV(verilogPath);
    const sdfData: IDataStructure = await sdf_parser.getJsonObjectFromSdf(sdfPath);

    // Merge the parsed data from both files
    const mergedData: IDataStructure = {
        elements: [...verilogData.elements, ...sdfData.elements],
        connections: [...verilogData.connections, ...sdfData.connections]
    };

    // Return the merged data as a formatted JSON string
    return mergedData;
}