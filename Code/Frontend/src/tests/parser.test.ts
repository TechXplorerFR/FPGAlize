import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getJsonObjectFromParsing } from '../lib/services/parser';
import * as vParser from '../lib/services/v-parser';
import * as sdfParser from '../lib/services/sdf-parser';

// Mock the dependency parsers
vi.mock('../lib/services/v-parser');
vi.mock('../lib/services/sdf-parser');

describe('Combined Parser', () => {
  const mockVerilogPath = '/path/to/test.v';
  const mockSdfPath = '/path/to/test.sdf';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should correctly merge data from verilog and sdf parsers', async () => {
    // Mock Verilog parser results
    const verilogResult = {
      elements: [
        { 
          id: 1, 
          name: 'module1', 
          type: 'verilog_module',
          innerText: 'Module module1',
          icon: 'path-to-an-icon',
          clicked: false, 
          inputs: ['a'], 
          outputs: ['b'] 
        }
      ],
      connections: []
    };
    
    // Mock SDF parser results
    const sdfResult = {
      elements: [
        { 
          id: 2, 
          name: 'dff1', 
          type: 'DFF',
          innerText: 'Element of type DFF',
          icon: 'path-to-an-icon',
          clicked: false, 
          inputs: ['CLK'], 
          outputs: ['Q'] 
        }
      ],
      connections: [
        { 
          id: 1, 
          from: 'dff1.CLK', 
          fromLabel: 'input',
          to: 'dff1.Q', 
          toLabel: 'output',
          color: 'red', 
          time: 1.5 
        }
      ]
    };
    
    // Setup mocks
    vi.mocked(vParser.getJsonObjectFromV).mockResolvedValueOnce(verilogResult);
    vi.mocked(sdfParser.getJsonObjectFromSdf).mockResolvedValueOnce(sdfResult);

    // Call the combined parser
    const result = await getJsonObjectFromParsing(mockVerilogPath, mockSdfPath);

    // Verify the structure is merged correctly
    expect(typeof result !== 'string').toBe(true);
    if (typeof result !== 'string') {
      expect(result.elements.length).toBe(2);
      expect(result.connections.length).toBe(1);
      
      // Check elements are all present
      expect(result.elements).toContainEqual(verilogResult.elements[0]);
      expect(result.elements).toContainEqual(sdfResult.elements[0]);
      
      // Check connections are all present
      expect(result.connections).toContainEqual(sdfResult.connections[0]);
    }
  });

  it('should return error message for invalid file extensions', async () => {
    // Call with invalid paths
    const result = await getJsonObjectFromParsing('/path/to/invalid.txt', '/path/to/invalid.txt');
    
    // Should return an error message as string
    expect(typeof result).toBe('string');
    expect(result).toContain('not valid');
  });

  it('should handle errors from individual parsers', async () => {
    // Setup mocks to simulate an error in one parser
    vi.mocked(vParser.getJsonObjectFromV).mockResolvedValueOnce({ elements: [], connections: [] });
    vi.mocked(sdfParser.getJsonObjectFromSdf).mockRejectedValueOnce(new Error('Parser error'));

    // Call the combined parser
    const result = await getJsonObjectFromParsing(mockVerilogPath, mockSdfPath);

    // Should still return a result with just the verilog data
    expect(typeof result !== 'string').toBe(true);
    if (typeof result !== 'string') {
      expect(result.elements).toEqual([]);
      expect(result.connections).toEqual([]);
    }
  });
});
