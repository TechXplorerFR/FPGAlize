import type { IDataStructure } from "@/lib/types/types";
import { toast } from "sonner";

/**
 * Browser-compatible function to parse SDF content from a string.
 * This function processes the provided content string instead of reading from a file.
 * @param {string} content - String content of the SDF file.
 * @param {IDataStructure} verilogData - Existing data structure from Verilog parsing.
 * @returns {IDataStructure} - An object containing parsed elements and connections with delays.
 */
export function parseSdfContent(
  content: string,
  verilogData: IDataStructure
): IDataStructure {
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if(lines[i].trim() === "(CELL") {
      try {
        let connName = lines[i+2].trim().split(" ")[1].replace(")", "").replace("routing_segment_", "");
      let delay = Number(lines[i+5].trim().split(" ")[3].split(":")[0].replace("(", "").replace(")", ""));

      verilogData.connections.find((conn) => {
        if(conn.name === connName) {
          conn.time = delay;
          return true;
        }
        return false;
      });
      } catch (error) {
        toast.error("Error while parsing SDF content");
        console.error("Error parsing SDF content:", error);
      }
    }
  }

  return verilogData;
}
