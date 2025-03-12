import { getJsonObjectFromParsing } from "../parser";

/**
 * Main function that demonstrates how to parse and merge Verilog and SDF files.
 * This function calls the `getJsonObjectFromParsing` function to parse the given
 * Verilog and SDF files, and logs the resulting merged JSON data to the console.
 */
async function main() {
    let parsedData: string = await getJsonObjectFromParsing("test.v", "test.sdf");

    console.log(parsedData);
}

main();
