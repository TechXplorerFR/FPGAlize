import * as v_parser from '../lib/services/v-parser';
import { describe, it, expect } from 'vitest';

// Mock the File API for testing browser-specific functions
global.File = class MockFile {
  name: string;
  content: string;
  type: string;
  
  constructor(content: string[], name: string, options: { type: string }) {
    this.name = name;
    this.content = content.join('');
    this.type = options.type;
  }
  
  text(): Promise<string> {
    return Promise.resolve(this.content);
  }
} as any;

describe('Verilog Parser Service', () => {
  describe('tokenizeVerilog', () => {
    it('should tokenize verilog content correctly', () => {
      const content = 'module test (input a, output b);';
      const tokens = (v_parser as any).tokenizeVerilog(content);
      
      expect(tokens).toEqual(['module', 'test', 'input', 'a', 'output', 'b']);
    });
    
    it('should handle empty content', () => {
      const content = '';
      const tokens = (v_parser as any).tokenizeVerilog(content);
      
      expect(tokens).toEqual([]);
    });
  });
  
  describe('parseVerilogContent', () => {
    it('should parse basic module definition', () => {
      const content = `
        module test (
          input clk,
          input reset,
          output out
        );
        endmodule
      `;
      
      const result = v_parser.parseVerilogContent(content);
      
      expect(result.elements.length).toBeGreaterThan(0);
      expect(result.connections.length).toBeGreaterThan(0);
      
      const moduleInputs = result.elements.filter(e => 
        e.type === 'module_input' || e.name === 'clk' || e.name === 'reset'
      );
      const moduleOutputs = result.elements.filter(e => e.type === 'module_output');
      
      expect(moduleInputs.length).toBe(2);
      expect(moduleOutputs.length).toBe(1);
    });
    
    it('should handle complex module with wire declarations', () => {
      const content = `
        module counter (
          input clk,
          input reset,
          output [3:0] count
        );
          wire internal;
          // Some module logic would be here
        endmodule
      `;
      
      const result = v_parser.parseVerilogContent(content);
      
      expect(result.elements.length).toBeGreaterThan(0);
      expect(result.elements.some(e => e.name === 'clk')).toBe(true);
    });
    
    it('should handle errors gracefully', () => {
      const invalidContent = `
        module broken (
          input clk,
          // Missing endmodule
      `;
      
      const result = v_parser.parseVerilogContent(invalidContent);
      
      // Should still return a data structure even if incomplete
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('connections');
    });
  });
  
  describe('getJsonObjectFromV', () => {
    it('should parse a verilog file into JSON structure', async () => {
      const mockFile = new File([`
        module test (
          input clk,
          output out
        );
        endmodule
      `], 'test.v', { type: 'text/plain' });
      
      const result = await v_parser.getJsonObjectFromV(mockFile);
      
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('connections');
      expect(result.elements.some(e => e.name === 'clk')).toBe(true);
    });
  });
});
