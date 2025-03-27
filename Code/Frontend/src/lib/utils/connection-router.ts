/**
 * Helper functions for routing connections between elements
 */

export type Direction = 'left' | 'right' | 'top' | 'bottom';

export interface Point {
  x: number;
  y: number;
}

export interface PortInfo {
  x: number;
  y: number;
  direction: Direction;
}

export interface EdgePoint extends Point {
  direction: Direction;
}

/**
 * Calculates the path points for a connection between two ports
 */
export function calculateConnectionPath(
  source: EdgePoint,
  dest: EdgePoint,
): Point[] {
  const path: Point[] = [{ x: source.x, y: source.y }];
  
  // Minimum distance segments should extend from components
  const minExtension = 15;
  
  // Different routing strategies based on source and destination directions
  if (
    (source.direction === 'right' && dest.direction === 'left') ||
    (source.direction === 'left' && dest.direction === 'right')
  ) {
    // Horizontal connection - use a midpoint for cleaner routing
    const midX = (source.x + dest.x) / 2;
    
    // Ensure minimum extension from component
    if (Math.abs(midX - source.x) < minExtension) {
      const extendedX = source.x + (source.direction === 'right' ? minExtension : -minExtension);
      path.push({ x: extendedX, y: source.y });
      path.push({ x: extendedX, y: dest.y });
    } else {
      path.push({ x: midX, y: source.y });
      path.push({ x: midX, y: dest.y });
    }
  } 
  else if (
    (source.direction === 'top' && dest.direction === 'bottom') ||
    (source.direction === 'bottom' && dest.direction === 'top')
  ) {
    // Vertical connection - use a midpoint for cleaner routing
    const midY = (source.y + dest.y) / 2;
    
    // Ensure minimum extension from component
    if (Math.abs(midY - source.y) < minExtension) {
      const extendedY = source.y + (source.direction === 'bottom' ? minExtension : -minExtension);
      path.push({ x: source.x, y: extendedY });
      path.push({ x: dest.x, y: extendedY });
    } else {
      path.push({ x: source.x, y: midY });
      path.push({ x: dest.x, y: midY });
    }
  }
  else {
    // Mixed directions - create proper corners with minimum extensions
    
    // Calculate extensions based on port directions
    const sourceExtension = 
      (source.direction === 'right' || source.direction === 'left') ? 
      { x: source.x + (source.direction === 'right' ? minExtension : -minExtension), y: source.y } :
      { x: source.x, y: source.y + (source.direction === 'bottom' ? minExtension : -minExtension) };
    
    const destExtension =
      (dest.direction === 'right' || dest.direction === 'left') ?
      { x: dest.x + (dest.direction === 'right' ? -minExtension : minExtension), y: dest.y } :
      { x: dest.x, y: dest.y + (dest.direction === 'bottom' ? -minExtension : minExtension) };
    
    // Add extension points to path
    path.push(sourceExtension);
    
    // Add corner point
    if ((source.direction === 'right' || source.direction === 'left')) {
      path.push({ x: sourceExtension.x, y: destExtension.y });
    } else {
      path.push({ x: destExtension.x, y: sourceExtension.y });
    }
    
    // Add destination extension point
    path.push(destExtension);
  }
  
  path.push({ x: dest.x, y: dest.y });
  return path;
}

/**
 * Calculates a position along a multi-segment path based on a percentage
 */
export function getPointAlongPath(path: Point[], percentage: number): Point {
  if (path.length < 2) return path[0] || { x: 0, y: 0 };
  
  // Calculate total path length
  let totalLength = 0;
  const segmentLengths: number[] = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const length = Math.sqrt(
      Math.pow(path[i+1].x - path[i].x, 2) + 
      Math.pow(path[i+1].y - path[i].y, 2)
    );
    segmentLengths.push(length);
    totalLength += length;
  }
  
  // If path has zero length, return first point
  if (totalLength === 0) return path[0];
  
  // Calculate target distance along path
  const targetDistance = percentage * totalLength;
  
  // Find the segment containing the target point
  let distanceCovered = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    if (distanceCovered + segmentLengths[i] >= targetDistance) {
      // This segment contains our target point
      const segmentPercentage = (targetDistance - distanceCovered) / segmentLengths[i];
      
      // Interpolate between segment start and end points
      return {
        x: path[i].x + segmentPercentage * (path[i+1].x - path[i].x),
        y: path[i].y + segmentPercentage * (path[i+1].y - path[i].y)
      };
    }
    distanceCovered += segmentLengths[i];
  }
  
  // Fallback to final point if something went wrong
  return path[path.length - 1];
}