import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getJsonObjectFromV } from '../lib/services/v-parser';
import * as fs from 'node:fs/promises';

// Mock the fs module
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('Verilog Parser', () => {
  const mockVerilogPath = '/path/to/test.v';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should parse module definitions correctly', async () => {
    // Mock a sample Verilog file content
    const mockVerilogContent = `
      module test_module (
        input wire clk,
        input wire data,
        output wire q
      );
        
        // Some logic here
        
      endmodule
    `;
    
    // Setup the mock to return our content
    vi.mocked(fs.readFile).mockResolvedValue(mockVerilogContent);

    // Call the function
    const result = await getJsonObjectFromV(mockVerilogPath);

    // Verify the parsed structure
    expect(result).toHaveProperty('elements');
    expect(result).toHaveProperty('connections');
    
    // Check that we have an element for the module
    const elements = result.elements;
    expect(elements.length).toBe(1);
    
    const moduleElement = elements[0];
    expect(moduleElement.name).toBe('test_module');
    expect(moduleElement.type).toBe('verilog_module');
    
    // Check that inputs and outputs are captured
    expect(moduleElement.inputs).toContain('clk');
    expect(moduleElement.inputs).toContain('data');
    expect(moduleElement.outputs).toContain('q');
  });

  it('should parse multiple modules in a file', async () => {
    // Mock a Verilog file with multiple modules
    const mockVerilogContent = `
      module module1 (
        input a,
        output b
      );
      endmodule

      module module2 (
        input x,
        output y
      );
      endmodule
    `;
    
    vi.mocked(fs.readFile).mockResolvedValue(mockVerilogContent);

    // Call the function
    const result = await getJsonObjectFromV(mockVerilogPath);

    // Verify we have two modules
    expect(result.elements.length).toBe(2);
    
    // Check first module
    expect(result.elements[0].name).toBe('module1');
    expect(result.elements[0].inputs).toContain('a');
    expect(result.elements[0].outputs).toContain('b');
    
    // Check second module
    expect(result.elements[1].name).toBe('module2');
    expect(result.elements[1].inputs).toContain('x');
    expect(result.elements[1].outputs).toContain('y');
  });

  it('should handle empty Verilog file gracefully', async () => {
    // Mock an empty Verilog file
    vi.mocked(fs.readFile).mockResolvedValue('');

    // Call the function
    const result = await getJsonObjectFromV(mockVerilogPath);

    // Verify we get an empty structure but no errors
    expect(result).toEqual({ elements: [], connections: [] });
  });

  it('should handle file read errors', async () => {
    // Mock a file read error
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

    // Call and check that the function handles the error
    const result = await getJsonObjectFromV(mockVerilogPath);
    
    // Should return empty structure on error
    expect(result).toEqual({ elements: [], connections: [] });
  });
});
