import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getJsonObjectFromSdf } from '../lib/services/sdf-parser';
import * as fs from 'node:fs/promises';

// Mock the fs module
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('SDF Parser', () => {
  const mockSdfPath = '/path/to/test.sdf';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should extract timing delays correctly', async () => {
    // Mock a sample SDF file content with timing information
    const mockSdfContent = `
      (DELAYFILE
        (SDFVERSION "3.0")
        (DESIGN "test_module")
        (CELLTYPE "DFF")
        (INSTANCE dff1)
        (IOPATH CLK Q (1.2:1.5:1.8) (2.0:2.5:3.0))
        (IOPATH D Q (0.5:0.7:0.9))
      )
    `;
    
    // Setup the mock to return our content
    vi.mocked(fs.readFile).mockResolvedValue(mockSdfContent);

    // Call the function
    const result = await getJsonObjectFromSdf(mockSdfPath);

    // Verify the parsed structure
    expect(result).toHaveProperty('elements');
    expect(result).toHaveProperty('connections');
    
    // Check that we have an element for the DFF instance
    const elements = result.elements;
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.some(el => el.name === 'dff1' && el.type === 'DFF')).toBe(true);
    
    // Check connections
    const connections = result.connections;
    expect(connections.length).toBeGreaterThan(0);
    expect(connections.some(conn => 
      conn.from.includes('dff1.CLK') && 
      conn.to.includes('dff1.Q') && 
      conn.time === 1.5 // typical value
    )).toBe(true);
    
    expect(connections.some(conn => 
      conn.from.includes('dff1.D') && 
      conn.to.includes('dff1.Q') && 
      conn.time === 0.7 // typical value
    )).toBe(true);
  });

  it('should handle empty SDF file gracefully', async () => {
    // Mock an empty SDF file
    vi.mocked(fs.readFile).mockResolvedValue('');

    // Call the function
    const result = await getJsonObjectFromSdf(mockSdfPath);

    // Verify we get an empty structure but no errors
    expect(result).toEqual({ elements: [], connections: [] });
  });

  it('should handle file read errors', async () => {
    // Mock a file read error
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

    // Call and check that the function handles the error
    const result = await getJsonObjectFromSdf(mockSdfPath);
    
    // Should return empty structure on error
    expect(result).toEqual({ elements: [], connections: [] });
  });
});
