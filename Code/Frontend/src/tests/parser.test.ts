import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as parser from '../lib/services/parser';
import * as v_parser from '../lib/services/v-parser';
import * as sdf_parser from '../lib/services/sdf-parser';
import { IDataStructure } from '../lib/types/types';

// Mock dependencies
vi.mock('../lib/services/v-parser');
vi.mock('../lib/services/sdf-parser');
vi.mock('../lib/utils', () => ({
  getFileContent: vi.fn().mockImplementation(() => Promise.resolve('mock content'))
}));

describe('Parser Service', () => {
  let mockVerilogFile: File;
  let mockSdfFile: File;
  let mockVerilogData: IDataStructure;
  let mockSdfData: IDataStructure;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create mock files
    mockVerilogFile = new File(['mock verilog content'], 'test.v', { type: 'text/plain' });
    mockSdfFile = new File(['mock sdf content'], 'test.sdf', { type: 'text/plain' });
    
    // Mock data structures
    mockVerilogData = {
      elements: [
        { 
          id: 1, 
          name: 'module1',
          type: 'verilog_module', 
          x: null, 
          y: null,
          inputs: [{ wireName: 'wire1', inputName: 'in1' }], 
          outputs: [{ wireName: 'wire2', outputName: 'out1' }],
          internal_delay: 0,
          setup_time: 0
        }
      ],
      connections: [
        { id: 1, name: 'wire1', type: 'wire', color: '#000000', time: 0 }
      ]
    };
    
    mockSdfData = {
      elements: [
        { 
          id: 2, 
          name: 'module2',
          type: 'sdf_module', 
          x: null, 
          y: null,
          inputs: [{ wireName: 'wire3', inputName: 'in2' }], 
          outputs: [{ wireName: 'wire4', outputName: 'out2' }],
          internal_delay: 0.5,
          setup_time: 0.2
        }
      ],
      connections: [
        { id: 2, name: 'wire3', type: 'wire', color: '#000000', time: 0.3 }
      ]
    };
    
    // Set up mock implementations
    (v_parser.getJsonObjectFromV as any).mockResolvedValue(mockVerilogData);
    (sdf_parser.getJsonObjectFromSdf as any).mockResolvedValue(mockSdfData);
    (v_parser.parseVerilogContent as any).mockResolvedValue(mockVerilogData);
    (sdf_parser.parseSdfContent as any).mockResolvedValue(mockSdfData);
  });
  
  describe('checkFileExtension', () => {
    it('should return true when file has the expected extension', () => {
      const result = (parser as any).checkFileExtension('test.v', 'v');
      expect(result).toBe(true);
    });
    
    it('should return false when file does not have the expected extension', () => {
      const result = (parser as any).checkFileExtension('test.txt', 'v');
      expect(result).toBe(false);
    });
  });
  
  describe('getJsonObjectFromParsing', () => {
    it('should return error message when file extensions are invalid', async () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await parser.getJsonObjectFromParsing(invalidFile, mockSdfFile);
      
      expect(result).toBe('Provided files are not valid .v and .sdf files.');
    });
    
    it('should merge verilog and sdf data correctly', async () => {
      const result = await parser.getJsonObjectFromParsing(mockVerilogFile, mockSdfFile);
      
      expect(v_parser.getJsonObjectFromV).toHaveBeenCalledWith(mockVerilogFile);
      expect(sdf_parser.getJsonObjectFromSdf).toHaveBeenCalledWith(mockSdfFile);
      
      if (typeof result !== 'string') {
        expect(result.elements.length).toBe(2);
        expect(result.connections.length).toBe(2);
      } else {
        throw new Error('Expected result to be an object but got a string');
      }
    });
  });
  
  describe('parseFilesForBrowser', () => {
    it('should return null when file extensions are invalid', async () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await parser.parseFilesForBrowser(invalidFile, mockSdfFile);
      
      expect(result).toBeNull();
    });
    
    it('should parse and merge files correctly', async () => {
      const result = await parser.parseFilesForBrowser(mockVerilogFile, mockSdfFile);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.elements.length).toBeGreaterThan(0);
        expect(result.connections.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('Helper functions', () => {
    it('should clean names correctly', () => {
      const name = '\\module1';
      const result = (parser as any).cleanName(name);
      expect(result).toBe('module1');
    });
    
    it('should determine correct element type', () => {
      // Test clock type
      const clockType = (parser as any).cleanType('clk', 'unknown', []);
      expect(clockType).toBe('clk');
      
      // Test DFF type
      const dffType = (parser as any).cleanType('dff1', 'DFF', [{ wireName: 'w1' }, { wireName: 'w2' }]);
      expect(dffType).toBe('DFF');
      
      // Test LUT type
      const lutType = (parser as any).cleanType('lut', 'unknown', [
        { wireName: 'w1' }, { wireName: 'w2' }, { wireName: 'w3' }
      ]);
      expect(lutType).toBe('LUT3');
    });
  });
});
