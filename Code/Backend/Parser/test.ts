import * as sdf_parser from "./sdf-parser";

async function main() {
    let parsedData: string = await sdf_parser.getJsonObjectFromSdfFile("test.sdf");
    console.log(parsedData);
}

main();
