import * as sdf_parser from '../lib/services/sdf-parser';
import { describe, it, expect, vi } from 'vitest';

// Mock the File API for testing browser-specific functions
global.File = class MockFile {
  name: string;
  content: string;
  
  constructor(content: string[], name: string) {
    this.name = name;
    this.content = content.join('');
  }
  
  text(): Promise<string> {
    return Promise.resolve(this.content);
  }
} as any;

describe('SDF Parser Tests', () => {
  // Sample SDF content for testing
  const sampleSdfContent = `
  (DELAYFILE
    (SDFVERSION "3.0")
    (DESIGN "test_design")
    (CELLTYPE "Buffer")
    (INSTANCE U1)
    (DELAY
      (ABSOLUTE
        (IOPATH A Y (0.1:0.2:0.3))
      )
    )
    (CELLTYPE "AND2")
    (INSTANCE U2)
    (DELAY
      (ABSOLUTE
        (IOPATH A Y (0.2:0.3:0.4))
        (IOPATH B Y (0.1:0.15:0.2))
      )
    )
  )`;

  describe('tokenizeSDF function', () => {
    it('should tokenize SDF content correctly', () => {
      // Access the private function using type assertion
      const tokenize = (sdf_parser as any).tokenizeSDF;
      
      const tokens = tokenize('(DELAYFILE (DESIGN "test"))');
      expect(tokens).toContain('DELAYFILE');
      expect(tokens).toContain('DESIGN');
      expect(tokens).toContain('test');
    });
    
    it('should filter out empty tokens', () => {
      const tokenize = (sdf_parser as any).tokenizeSDF;
      const tokens = tokenize('(  DELAYFILE   (DESIGN  "test" ) )');
      expect(tokens.includes('')).toBe(false);
    });
  });
  
  describe('extractDelays function', () => {
    it('should extract delay values correctly', () => {
      const extractDelays = (sdf_parser as any).extractDelays;
      const tokens = ['IOPATH', 'A', 'Y', '0.1:0.2:0.3', 'END'];
      
      const delays = extractDelays(tokens, 3);
      expect(delays.min).toBe(0.1);
      expect(delays.typical).toBe(0.2);
      expect(delays.max).toBe(0.3);
    });
    
    it('should return empty object if no delays found', () => {
      const extractDelays = (sdf_parser as any).extractDelays;
      const tokens = ['IOPATH', 'A', 'Y', 'NO_MATCH', 'END'];
      
      const delays = extractDelays(tokens, 3);
      expect(delays).toEqual({});
    });
  });
  
  describe('parseSdfContent function', () => {
    it('should parse SDF content into data structure correctly', () => {
      const result = sdf_parser.parseSdfContent(sampleSdfContent);
      
      expect(result).toBeDefined();
      expect(result.elements.length).toBe(2); // Two instances: U1 and U2
      expect(result.connections.length).toBeGreaterThan(0);
      
      // Check first element properties
      const firstElement = result.elements[0];
      expect(firstElement.name).toBe('U1');
      expect(firstElement.type).toBe('Buffer');
      expect(firstElement.internal_delay).toBeDefined();
      
      // Check second element properties
      const secondElement = result.elements[1];
      expect(secondElement.name).toBe('U2');
      expect(secondElement.type).toBe('AND2');
      
      // Check that connections were created
      const connections = result.connections;
      expect(connections.some(c => c.time > 0)).toBe(true);
    });
    
    it('should handle errors gracefully', () => {
      const invalidContent = '(DELAYFILE (BROKEN CONTENT';
      const result = sdf_parser.parseSdfContent(invalidContent);
      
      // Should still return a valid structure even with invalid content
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('connections');
    });
  });
  
  describe('getJsonObjectFromSdf function', () => {
    it('should process a File object correctly', async () => {
      // Create a mock SDF file
      const mockFile = new File([sampleSdfContent], 'test.sdf', { type: 'text/plain' });
      
      // Spy on parseSdfContent
      const parseSpy = vi.spyOn(sdf_parser, 'parseSdfContent');
      
      const result = await sdf_parser.getJsonObjectFromSdf(mockFile);
      
      // Check that parseSdfContent was called with the file content
      expect(parseSpy).toHaveBeenCalledWith(sampleSdfContent);
      
      // Check result structure
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('connections');
      expect(result.elements.length).toBeGreaterThan(0);
      
      // Clean up
      parseSpy.mockRestore();
    });
  });
});
