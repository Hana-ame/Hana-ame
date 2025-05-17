// src/types.ts

// Data structure for a single plane
export interface PlaneData {
    id: string; // Unique ID for React keys and cleanup
    width: number;
    height: number;
    x: number; // World coordinate X (center of the plane)
    y: number; // World coordinate Y (center of the plane)
    color: string; // Hex color string
  }
  
  // Data structure for the config of the next plane to add
  export interface NewPlaneConfig {
    width: number;
    height: number;
    color: string;
  }
  
  // Data structure for clicked coordinates in world space
  export interface ClickedCoords {
      x: number;
      y: number;
  }