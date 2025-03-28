import * as sdf_parser from '../lib/services/sdf-parser';
import { describe, it, expect, vi } from 'vitest';

// Mock the File API for testing browser-specific functions
global.File = class MockFile {
  name: string;
  content: string;
  type: string;
  
  constructor(content: string[], name: string, options: { type: string }) {
    this.name = name;
    this.content = content[0]; // Use the first element directly instead of joining
    this.type = options.type;
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
      // Now access the exported function directly
      const tokens = sdf_parser.tokenizeSDF('(DELAYFILE (DESIGN "test"))');
      
      // Check for the token with quotes to better understand what tokenizeSDF returns
      const testToken = tokens.find(token => token.includes('test'));
      expect(testToken).toBeDefined();
      // If tokenizeSDF returns "test" with quotes, we can check it contains test instead
      expect(testToken).toContain('test');
      
      expect(tokens).toContain('DELAYFILE');
      expect(tokens).toContain('DESIGN');
    });
    
    it('should filter out empty tokens', () => {
      const tokens = sdf_parser.tokenizeSDF('(  DELAYFILE   (DESIGN  "test" ) )');
      expect(tokens.includes('')).toBe(false);
    });
  });
  
  describe('extractDelays function', () => {
    it('should extract delay values correctly', () => {
      const tokens = ['IOPATH', 'A', 'Y', '0.1:0.2:0.3', 'END'];
      
      const delays = sdf_parser.extractDelays(tokens, 3);
      expect(delays.min).toBe(0.1);
      expect(delays.typical).toBe(0.2);
      expect(delays.max).toBe(0.3);
    });
    
    it('should return empty object if no delays found', () => {
      const tokens = ['IOPATH', 'A', 'Y', 'NO_MATCH', 'END'];
      
      const delays = sdf_parser.extractDelays(tokens, 3);
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
      // Reset any mocks from previous tests
      vi.restoreAllMocks();
      
      // Create a mock SDF file with correct content
      const mockFile = new File([sampleSdfContent], 'test.sdf', { type: 'text/plain' });
      
      // Set up the spy BEFORE calling getJsonObjectFromSdf
      // Make sure we're using the correct function reference
      const parseSpy = vi.spyOn(sdf_parser, 'parseSdfContent');
      
      // Call the function and make sure we await it
      const result = await sdf_parser.getJsonObjectFromSdf(mockFile);
      
      // Verify the spy was called with the correct arguments
      expect(parseSpy).toHaveBeenCalledWith(expect.any(String));
      
      // Check result structure
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('connections');
      
      // Clean up
      parseSpy.mockRestore();
    });
  });
});
