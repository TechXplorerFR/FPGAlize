import { Example } from "@/lib/types/types";
import { getFileContent } from "@/lib/utils";
import { parseFilesForBrowser } from "@/lib/services/parser";

/**
 * Parses uploaded files into an Example object
 * @param originalVerilogFile Original Verilog file uploaded by the user
 * @param postSynthesisVerilogFile Post-synthesis Verilog file
 * @param postSynthesisSdfFile SDF file with timing information
 * @returns A Promise that resolves to an Example object
 */
export async function parseUploadedExample(
  originalVerilogFile: File,
  postSynthesisVerilogFile: File,
  postSynthesisSdfFile: File
): Promise<Example> {
  try {
    // Count lines in the original Verilog file
    const content = await getFileContent(originalVerilogFile);
    const lineCount = content ? content.split("\n").length : 0;

    const jsonOutput = await parseFilesForBrowser(
      postSynthesisVerilogFile,
      postSynthesisSdfFile
    );


    // Return the formatted example object
    return {
      originalVerilogFile,
      postSynthesisVerilogFile,
      postSynthesisSdfFile,
      jsonOutput,
      originalVerilogFileInformation: {
        name: originalVerilogFile.name.split(".")[0],
        lineCount,
        fileSize: originalVerilogFile.size,
      },
    };
  } catch (error) {
    console.error("Error parsing uploaded files:", error);
    throw new Error(
      `Failed to parse files: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
