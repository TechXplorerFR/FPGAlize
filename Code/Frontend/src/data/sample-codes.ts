export const sampleCodes: string[] = [
  `module dff (
    input wire clk, rst, d,
    output reg q
    );
    always @(posedge clk or posedge rst)
        if (rst)
        q <= 1'b0;
        else
        q <= d;
    endmodule`,
  `module adder (
    input wire [3:0] a, b,
    output wire [3:0] sum
    );
    assign sum = a + b;
    endmodule`,
  `module mux2to1 (
    input wire sel, a, b,
    output wire y
    );
    assign y = sel ? a : b;
    endmodule`,
];
