/**
 * Port configuration for elements
 * Defines where input and output ports are positioned on each element type
 * Positions are relative (0-1) where:
 * - (0,0) is the top-left corner
 * - (1,1) is the bottom-right corner
 */

export interface Port {
  id: string;
  x: number; // Relative x position (0-1)
  y: number; // Relative y position (0-1)
  type: 'input' | 'output';
}

export interface ElementPortConfig {
  inputs: Port[];
  outputs: Port[];
}

// Default port configuration used when no specific config is found
const defaultPortConfig: ElementPortConfig = {
  inputs: [
    { id: 'in1', x: 0, y: 0.25, type: 'input' },
    { id: 'in2', x: 0, y: 0.75, type: 'input' }
  ],
  outputs: [
    { id: 'out', x: 1, y: 0.5, type: 'output' }
  ]
};

// Port configurations for specific element types
export const elementPortConfigs: Record<string, ElementPortConfig> = {
  // Logic gates
  'and': {
    inputs: [
      { id: 'in1', x: 0, y: 0.3, type: 'input' },
      { id: 'in2', x: 0, y: 0.7, type: 'input' }
    ],
    outputs: [
      { id: 'out', x: 1, y: 0.5, type: 'output' }
    ]
  },
  'or': {
    inputs: [
      { id: 'in1', x: 0, y: 0.3, type: 'input' },
      { id: 'in2', x: 0, y: 0.7, type: 'input' }
    ],
    outputs: [
      { id: 'out', x: 1, y: 0.5, type: 'output' }
    ]
  },
  'module_input': {
    inputs: [],
    outputs: [
      { id: 'out', x: 1, y: 0.5, type: 'output' }
    ]
  },
  'module_output': {
    inputs: [
      { id: 'in', x: 0, y: 0.5, type: 'input' }
    ],
    outputs: []
  },
  'DFF': {
    inputs: [
      { id: 'D', x: 0.3, y: 0.07, type: 'input' },
      { id: 'CLK', x: 0.3, y: 1, type: 'input' },
      { id: 'EN', x: 0.3, y: 0.5, type: 'input' }
    ],
    outputs: [
      { id: 'Q', x: 0, y: 0.2, type: 'output' }
    ]
  },
};

// Enhanced port position calculation that returns position and direction
export function calculatePortPosition(
  element: any,
  portId: string,
  portType: 'input' | 'output',
  dimensions: { width: number; height: number }
): { x: number; y: number; direction: 'left' | 'right' | 'top' | 'bottom' } | null {
  // Get port configuration for this element type
  const config = elementPortConfigs[element.type] || defaultPortConfig;
  
  // Get ports array based on type
  const ports = portType === 'input' ? config.inputs : config.outputs;
  
  // Find the specific port
  const port = ports.find(p => p.id === portId || p.id === 'in' || p.id === 'out');
  
  if (!port) return null;
  
  // Calculate absolute position based on element position and dimensions
  const x = (element.x || 0) + port.x * dimensions.width;
  const y = (element.y || 0) + port.y * dimensions.height;

  const direction = portType === 'input' ? 'left' : 'right';
  
  return { x, y, direction };
}
